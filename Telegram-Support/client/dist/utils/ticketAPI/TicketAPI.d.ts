declare const ticketAPI: {
    getAll: (ticket: any) => Promise<import("axios").AxiosResponse<any, any>>;
    getById: (ticket: any) => Promise<import("axios").AxiosResponse<any, any>>;
    complete: (ticket: any) => Promise<import("axios").AxiosResponse<any, any>>;
};
export default ticketAPI;
