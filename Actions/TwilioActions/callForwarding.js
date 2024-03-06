const { VoiceResponse } = require("../../Twilio");
const {
    BadRequestError,
    ResourceNotFoundError,
    NotAuthorizedError,
} = require("../../errors");

module.exports.callForwarding = async (reqBody, models, twilio) => {
    let transaction = await models.sequelize.transaction();
    try {
        mapDetails = await models.phone_mapping.findAll({
            where: {
                twilio_number: reqBody.To
            }
        })
        console.log({ mapDetails: mapDetails });
        if (mapDetails?.length == 0 || (mapDetails[0]?.caller ? !(mapDetails[0]?.caller == reqBody?.From || mapDetails[0]?.host == reqBody?.From) : mapDetails[0]?.host == reqBody?.From)) {
            await transaction.rollback()
            return `<Response>
            <Say>Phone number not mapped</Say>
          </Response>`
        } else if (mapDetails[0]?.caller == null) {
            await models.phone_mapping.update(
                {
                    caller: reqBody.From
                },
                {
                    where: {
                        twilio_number: mapDetails[0].twilio_number
                    }
                },
                {
                    transaction: transaction
                }
            );
        }
        const response = new VoiceResponse();
        const dial = response.dial({ callerId: '+14344338771' });
        dial.number({
        }, reqBody?.From == mapDetails[0]?.host ? mapDetails[0]?.caller : mapDetails[0]?.host);
        await transaction.commit();
        return response.toString()
    } catch (error) {
        await transaction.rollback()
        throw error;
    }
};
