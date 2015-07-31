'use strict'

var userModel;


function schema() {
    var userSchema = new global.mongoose.Schema({
        firstName: {type: String},
        lastName:  {type: String},
        emailAddress:  {type: String, required:true, unique:true},
        userName: {type: String},
        password:  {type: String, required:true},
        facebookId: String
    });
    userSchema.plugin(global.uniqueValidator, { message: '{PATH}, already exists.' });
    return userSchema;
}

module.exports = function () {

    return {
        init : function () {
            var userSchema = schema();
            userModel = global.mongoose.model('UserModel', userSchema);
            console.info('User model created successfully');
            return;
        },
        new : function (object) {
            if (!userModel) {
                throw new Error('User Model not initialized, call init first.');
            }
            return new userModel(object);
        },
        find : function (filter, callback) {
            if (!userModel) {
                throw new Error('User Model not initialized, call init first.');
            }
            return userModel.find(filter, callback);
        }

    }
}
