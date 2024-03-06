const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

module.exports.changeStatus = async (reqBody, models) => {
    let transaction = await models.sequelize.transaction();
    try {
        await validateReq(reqBody, models)
        await models.available_number.update(
            {
                status: reqBody.status
            },
            {
                where: {
                    twilio_number: reqBody.phone
                }
            }, {
            transaction: transaction,
        })
        await transaction.commit();
        return "params";
    } catch (error) {
        await transaction.rollback()
        throw error;
    }
};

const validateReq = async (req, models) => {
    if (!req.phone) {
        throw new BadRequestError("Phone is required")
    }
    if (!req.status) {
        throw new BadRequestError("Status is required")
    }
    if (!["inactive", "active", "in_call"]?.includes(req?.status)) {
        throw new BadRequestError("Invalid status")
    }
    let phoneExists = await models.available_number.findOne({
        where: {
            twilio_number: req.phone
        }
    });
    if (!phoneExists) {
        throw new BadRequestError("Phone number does not exists");
    }
}
