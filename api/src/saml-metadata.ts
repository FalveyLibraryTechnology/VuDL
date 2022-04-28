import Authentication from "./services/Authentication";

const samlStrategy = Authentication.getInstance().getSamlStrategy();
console.log(samlStrategy.generateServiceProviderMetadata("", ""));
