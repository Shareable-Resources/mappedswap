declare const userAPI: {
    login: (user: any) => Promise<import("axios").AxiosResponse<any, any>>;
    logout: (user: any) => Promise<import("axios").AxiosResponse<any, any>>;
};
export default userAPI;
