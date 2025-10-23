// Simple test function to verify Netlify Functions are working
exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Netlify Functions are working correctly!",
            timestamp: new Date().toISOString(),
            event: {
                httpMethod: event.httpMethod,
                path: event.path,
                queryStringParameters: event.queryStringParameters
            }
        })
    };
};