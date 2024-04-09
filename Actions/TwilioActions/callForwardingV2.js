const { Sequelize } = require("sequelize");
const { VoiceResponse } = require("../../Twilio");
const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

module.exports.callForwardingV2 = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        let mappingExpiresMinutes = 1;

        let toDial = {};

        let mapDetails = await models.phone_mapping.findAll({
            attributes: [
                'id',
                'caller',
                'host',
                'twilio_number',
                'createdAt',
                'updatedAt',
                [
                    Sequelize.literal(`EXTRACT(EPOCH FROM (NOW() - "updatedAt"))/60`),
                    'timeDifference'
                ]
            ],
            where: {
                twilio_number: reqBody.To
            },
            order: [
                ['updatedAt', 'DESC']
            ]
        });

        if (mapDetails?.length == 0) {
            await transaction.commit();
            return `<Response>
                        <Say>Oops! It seems like your phone number is not registered for this host</Say>
                    </Response>`
        }

        let isHostCalling = mapDetails?.find(elem => elem.host == reqBody.From);

        if (isHostCalling?.id) {
            if (!isHostCalling?.caller || isHostCalling?.timeDifference > mappingExpiresMinutes) {
                await transaction.commit();
                return `<Response>
                            <Say>Oops! It seems like visitor's phone number is missing</Say>
                        </Response>`
            } else {
                toDial = isHostCalling;
            }
        } else {
            let visitorMapping = mapDetails[0];
            if (visitorMapping?.caller == null) {
                if (visitorMapping?.timeDifference >= 2) {
                    await models.phone_mapping.destroy({
                        where: {
                            id: visitorMapping?.id
                        }
                    },
                        {
                            transaction: transaction,
                        }
                    );
                    await transaction.commit();
                    return `<Response>
                                <Say>Oops! It seems like your registration for this host is expired</Say>
                            </Response>`
                } else {
                    toDial = visitorMapping;
                }
            } else if (visitorMapping?.caller != reqBody?.From) {
                await transaction.commit();
                return `<Response>
                            <Say>Oops! It seems like your phone number is not registered with this host</Say>
                        </Response>`
            } else if (visitorMapping?.timeDifference > mappingExpiresMinutes) {
                await transaction.commit();
                return `<Response>
                            <Say>Oops! It seems like your registration for this host is expired</Say>
                        </Response>`
            } else {
                toDial = visitorMapping;
            }
        }

        if (toDial?.id) {
            await models.phone_mapping.update(
                {
                    caller: reqBody?.From == toDial?.host ? toDial?.caller : reqBody?.From
                },
                {
                    where: {
                        id: toDial?.id
                    }
                },
                {
                    transaction: transaction
                }
            );
            console.log({ toDial })
            let response = dialHost(toDial?.twilio_number, reqBody?.From == toDial?.host ? toDial?.caller : toDial?.host)
            await transaction.commit();
            return response
        } else {
            await transaction.commit();
            return `<Response>
                        <Say>Oops! It seems like your phone number is not registered with this host</Say>
                    </Response>`
        }
    } catch (error) {
        await transaction.rollback()
        throw error;
    }
};

const dialHost = (twilioNumber, caller) => {
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: twilioNumber });
    dial.number({
    }, caller);
    return response.toString()
}
