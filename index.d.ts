// Doesn't matter what register is named - hapi plugin expects a function to be
// exported as the default.
declare module "hapi-graphql" {
  let register: () => any;
  export default register;
}