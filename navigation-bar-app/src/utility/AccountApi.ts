import springAxiosInst from "./AxiosInst.ts";


export const logoutRequest = async () => {
    const uri = springAxiosInst.getUri();



    return await springAxiosInst.post('/api/authentication/logout',
            {},
            {
                withCredentials: true
            }
    );
}


export const tokenVerification = async () => {
    const uri = springAxiosInst.getUri();

    return await springAxiosInst.get('/api/authentication/token/verification',
        {
            withCredentials: true
        }
    );
}