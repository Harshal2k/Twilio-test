const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");
const { external_api } = require("../../externalApiCall");

module.exports.mapUsers = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        //let numbers = await twilio.client.incomingPhoneNumbers.list({ status: 'active' });
        //let mappings = await models.phone_mapping.create({ host: '+919359192032', twilio_number: '+19134236245' })
        // let mappings = await models.available_number.findAll({
        //     where: {
        //         status: "inactive"
        //     }
        // });

        let userDetails = await external_api("GET", `/userManagement/internal/v1/organisations/${reqBody.orgId}/users/${reqBody.userId}/details`, process.env.UM_HOST_URL, null, null, process.env.UM_API_KEY)
        if (!userDetails?.message?.user?.phone) {
            throw new BadRequestError("User does not have a phone number assigned");
        }
        await models.phone_mapping.destroy({
            where: {
                twilio_number: '+14344338771'
            }
        }, {
            transaction: transaction
        })

        await models.phone_mapping.create({
            host: userDetails?.message?.user?.phone,
            twilio_number: '+14344338771'
        }, {
            transaction: transaction
        })

        await transaction.commit();
        return { twilioPhone: `+14344338771` };
    } catch (error) {
        await transaction.rollback();
        if (error?.error?.message?.errorCode == 875626513) {
            throw { message: "Something went wrong" }
        }
        throw error;
    }
};
