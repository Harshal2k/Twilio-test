var rp = require("request-promise");

module.exports.external_api = async function(
  method_name,
  uri,
  host,
  body = {},
  key = null,
  xApiKey = null
) {
  var options = {
    method: method_name,
    uri: host + uri,
    headers: {
      "Content-Type": "application/json",
      Authorization: key,
      "x-api-key": xApiKey,
    },
    json: true,
  };

  if (method_name !== "DELETE") {
    options.body = body;
  }

  console.log("[EXTERNAL API CALL] :", JSON.stringify(options));
  var result = await rp(options);

  console.log("[EXTERNAL API CALL RESPONSE] :", JSON.stringify(result));


  if (!result.type == "success") {
    throw new Error("Token is expired");
  }

  return result;
};
