const paystack = (request) => {
    const MySecertKey = 'Bearer sk_test_95eb60bb1b3aff2ad679b0cac2ec1c41f4b840e2';
    
    const initializePayment = (form, mycallback) => {
        const options = {
            url : 'https://api.paystack.co/transaction/initialize',
            headers : {
                authorization: MySecertKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'

            },
            form
        }
        const callback = (error, response, body) => {
            return mycallback(error, body);
        }
        request.post(options,callback);
    }

    const verifyPayment = (ref, mycallback) => {
        const options = {
            url: 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),

            headers: {
                authorization: MySecertKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            }
        }
        const callback = (error, response, body) => {
            return mycallback(error, body);
        }
        request(options,callback);

    }

    return {initializePayment, verifyPayment};

}
module.exports = paystack