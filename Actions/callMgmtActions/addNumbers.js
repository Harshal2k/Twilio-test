const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

module.exports.addNumbers = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        validateReq(reqBody)
        await models.available_number.bulkCreate(
            reqBody?.numbers?.map(phone => { return { twilio_number: phone } }) || [],
            {
                transaction: transaction,
                ignoreDuplicates: true,
            }
        );
        await transaction.commit();
        return "Phone numbers added successfully";
    } catch (error) {
        await transaction.rollback()
        throw error;
    }
};

const validateReq = (req) => {
    if (!req.numbers) {
        throw new BadRequestError("Numbers are required")
    }
    if (!Array.isArray(req.numbers)) {
        throw new BadRequestError("Numbers should be of type array")
    }
}
