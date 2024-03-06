//user model
module.exports = (sequelize, DataTypes) => {
    const available_number = sequelize.define("available_number", {
        twilio_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM,
            values: ["inactive", "active", "in_call"],
        }
    }, { timestamps: true },)
    return available_number
}