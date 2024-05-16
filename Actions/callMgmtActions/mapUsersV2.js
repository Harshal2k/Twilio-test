const { Op } = require("sequelize");
const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");
const { external_api } = require("../../externalApiCall");

module.exports.mapUsersV2 = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        let mappingExpiresMinutes = 1;// In how much minutes the phone mapping will expire once we have the caller number
        let nullCallerUpdatedAtInterval = 1;// In how much minutes the mapping will expire if the caller information is not present (happens when mapping is done but call is not initiated yet)

        if (!reqBody?.meetingId) {
            throw new BadRequestError("Meeting Id is required");
        }

        let userDetails = await external_api("GET", `/userManagement/internal/v1/organisations/${reqBody.orgId}/users/${reqBody.userId}/details`, process.env.UM_HOST_URL, null, null, process.env.UM_API_KEY)

        if (!userDetails?.message?.user?.phone) {
            throw new BadRequestError("User does not have a phone number assigned");
        }

        let hostNumber = userDetails?.message?.user?.phone;

        let twilioExists = [];
        if (reqBody?.twilioNumber) {
            let [twilioMapping, _twilioMapping] = await models.sequelize.query(`
            SELECT * FROM public.phone_mappings
            WHERE meeting_id = '${reqBody?.meetingId}' AND NOW() - "updatedAt" < interval '${mappingExpiresMinutes} minutes';
        `, { transaction: transaction });
            twilioExists = twilioMapping;
        }

        let isNumConnected = twilioExists?.find(elem => elem?.host == hostNumber && reqBody?.meetingId == elem.meeting_id)
        if (twilioExists?.length > 0 && isNumConnected?.id) {
            //SAME VISITOR IS TRYING TO CONNECT TO SAME HOST AGAIN

            //UPDATE IS JUST TO UPDATE THE UPDATE_AT FIELD WITH LATEST TIME
            await models.phone_mapping.update({ host: hostNumber },
                {
                    where: {
                        id: isNumConnected?.id
                    }
                },
                {
                    transaction: transaction
                }
            );
            await transaction.commit();
            return { twilioPhone: isNumConnected?.twilio_number };
        } else if (twilioExists?.length > 0 && reqBody?.twilioNumber) {
            // SAME TWILIO NUMBER CONNECTED TO DIFFERENT HOST FOR SAME VISITOR

            await deleteExpiredMapping(models, transaction, mappingExpiresMinutes, nullCallerUpdatedAtInterval);

            await models.available_number.update({ status: 'active' },
                {
                    where: {
                        twilio_number: reqBody?.twilioNumber
                    }
                },
                {
                    transaction: transaction,
                }
            );

            await models.phone_mapping.create({
                host: hostNumber,
                twilio_number: reqBody.twilioNumber,
                meeting_id: reqBody?.meetingId
            }, {
                transaction: transaction
            });
            await transaction.commit();
            return { twilioPhone: reqBody?.twilioNumber };
        }

        await deleteExpiredMapping(models, transaction, mappingExpiresMinutes, nullCallerUpdatedAtInterval);

        let getTwilioNumber = await models.available_number.findOne({
            where: {
                status: 'inactive'
            }
        },
            {
                transaction: transaction
            }
        )

        if (!getTwilioNumber) {
            throw new BadRequestError("Phone number currently unavailable");
        } else {
            await models.available_number.update({ status: 'active' },
                {
                    where: {
                        id: getTwilioNumber?.id
                    }
                },
                {
                    transaction: transaction,
                }
            );

            await models.phone_mapping.create({
                host: hostNumber,
                twilio_number: getTwilioNumber.twilio_number,
                meeting_id: reqBody?.meetingId
            }, {
                transaction: transaction
            })
        }

        await transaction.commit();
        return { twilioPhone: getTwilioNumber?.twilio_number };
    } catch (error) {
        await transaction.rollback();
        if (error?.error?.message?.errorCode == 875626513) {
            throw { message: "Something went wrong" }
        }
        throw error;
    }
};

const deleteExpiredMapping = async (models, transaction, mappingExpiresMinutes, nullCallerUpdatedAtInterval) => {
    try {
        let [deletedMappings, _deletedMappings] = await models.sequelize.query(`
            DELETE FROM public.phone_mappings
            WHERE (caller IS NOT NULL AND NOW() - "updatedAt" > interval '${mappingExpiresMinutes} minutes')
            OR (caller IS NULL AND NOW() - "updatedAt" > interval '${nullCallerUpdatedAtInterval} minutes')
            RETURNING twilio_number;
        `, { transaction: transaction });

        // REQUIRED TO PREVENT DELETION OF ALREADY PRESENT VALID MAPPING OF DELETED TWILIO NUMBER
        // one mapping can be valid and other not for the same twilio number, so if below step is not then then 
        // the status of that twilio number will be set to INACTIVE even if any one mapping is valid
        let [validMappings, _validMappings] = await models.sequelize.query(`
            SELECT * FROM public.phone_mappings where NOW() - "updatedAt" < interval '${mappingExpiresMinutes} minutes';
        `, { transaction: transaction })

        let validMappingNumbers = validMappings?.map(elem => elem.twilio_number) || [];

        let toDeleteTwilioNumbers = deletedMappings?.map(elem => elem.twilio_number) || [];

        toDeleteTwilioNumbers = toDeleteTwilioNumbers?.filter(elem => !validMappingNumbers?.includes(elem.twilio_number))

        console.log({ toDeleteTwilioNumbers });
        if (toDeleteTwilioNumbers?.length > 0) {
            await models.available_number.update(
                { status: 'inactive' },
                {
                    where: {
                        [Op.and]: [
                            { status: 'active' },
                            { twilio_number: { [Op.in]: toDeleteTwilioNumbers } }
                        ]
                    },
                },
                { transaction: transaction }
            );
        }
    } catch (error) {
        throw error
    }
}
