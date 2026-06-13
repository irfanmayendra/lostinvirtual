export const authConfig = {
  issuer: 'https://keycloak.lostinvirtual.world/realms/lostinvirtual',
  clientId: 'lostinvirtual-web',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
};
