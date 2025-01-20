import joi from "joi";

export const validateUser = (data) => {
    const Schema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    });
    return Schema.validate(data);
};


export const validatelogin = (data) => {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
    });
  
    return schema.validate(data);
  };
