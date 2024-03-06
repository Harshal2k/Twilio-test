const { Op } = require("sequelize");
const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

module.exports.deleteNumbers = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        validateReq(reqBody)
        await models.available_number.destroy({
            where: {
                twilio_number: {
                    [Op.in]: reqBody?.numbers
                }
            }
        },
            {
                transaction: transaction,
                ignoreDuplicates: true,
            }
        );
        await transaction.commit();
        return "Phone numbers deleted successfully";
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
