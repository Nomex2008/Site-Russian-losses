window.modifiedFilter = {
    /* https://www.daterangepicker.com/*/
    toDate: (date) => {
        return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))
            + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
            + '/' + date.getFullYear();
    },

    toUnixtime: (date) => {
        return new Date(date).getTime();
    },

    init: function () {
        const now = new Date();
        this.startDate = `02/24/2022 - ${this.toDate(now)}`;
        $('#modified').daterangepicker({
            startDate: this.startDate,
            minDate: new Date('02/24/2022'),
            maxDate: now,
        }, () => {Filters.apply()});
    },
    setStartDate: function (value) {
        const elData = $('#modified').data('daterangepicker');
        const dates = value.split(' - ');
        elData.setStartDate(dates[0]);
        elData.setEndDate(dates[1]);
    },

    clear: function() {
        this.setStartDate(this.startDate);
    },

    hash: function() {
        const value = $('#modified').val();
        if (this.startDate === value) {
            return '';
        }

        return value;
    },

    apply: function(photos) {
        const now = new Date();
        const self = this;
        let value = $('#modified').val();
        if (this.startDate === value) {
            return photos;
        }
        let filteredPhotos = photos;

        value = value.replace(' ', '');
        const start = this.toUnixtime(value.split('-')[0]);
        const end = this.toUnixtime(value.split('-')[1]);

        filteredPhotos = filteredPhotos.filter(function (photo) {
            if (!photo.modified || photo.modified === 'null') {
                return false;
            }
            const modified = self.toUnixtime(
                self.toDate(new Date(photo.modified))
            );

            return start <= modified && modified <= end;
        });

        return filteredPhotos;
    }
};