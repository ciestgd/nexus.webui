import moment from 'moment';

Date.prototype.toISOString = () => {
    return moment(this).format('YYYY-MM-DD HH:mm:ss');
};

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';