//user model
module.exports = (sequelize, DataTypes) => {
    const phone_mapping = sequelize.define("phone_mapping", {
        caller: {
            type: DataTypes.STRING,
            allowNull: true
        },
        host: {
            type: DataTypes.STRING,
            allowNull: true
        },
        twilio_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        meeting_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, { timestamps: true },)
    return phone_mapping
}