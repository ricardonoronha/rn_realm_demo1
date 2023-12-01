export interface IAppSettings {
    AppId: string;
    AwsAccessKey: string;
    AwsSecretKey: string;
}

const AppSettings: IAppSettings = {
    AppId: "",
    AwsAccessKey: "",
    AwsSecretKey: "",
}

export default AppSettings;