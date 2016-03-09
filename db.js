var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var AppInfo = new Schema({
        gcm_id : String,
        push_dates : [Date],
        push_acks : [Date],
        service_dates : [Date]
});

mongoose.model( 'AppInfo', AppInfo );
mongoose.connect( 'mongodb://localhost/experss-predict' );
