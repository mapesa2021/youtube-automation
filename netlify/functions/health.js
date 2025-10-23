// Netlify Function for health check
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed'
            })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            status: 'OK', 
            message: 'YouTube Automation Payment API is running',
            timestamp: new Date().toISOString()
        })
    };
};