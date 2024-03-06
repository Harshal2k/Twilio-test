const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

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
        let hostNumber = '+919359192032'//from external api call
        await models.phone_mapping.destroy({
            where: {
                twilio_number: '+14344338771'
            }
        }, {
            transaction: transaction
        })
        await models.phone_mapping.create({
            host: hostNumber,
            twilio_number: '+14344338771'
        }, {
            transaction: transaction
        })

        await transaction.commit();
        return { twilioPhone: `+14344338771` };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
