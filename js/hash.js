window.Hash = {
  init: function() {
    const hash = window.location.hash.replace('#', '');
    if (hash !== '') {
      const options = hash.split('&');
      $.each(options, function(i, option) {
        const optionName = option.split('=', 1)[0];
        const optionValue = decodeURIComponent(option.split('=')[1]);

        if (optionName === 'modified') {
          modifiedFilter.setStartDate(optionValue);
        } else if (optionName === 'index') {
          $('#index').val(optionValue);
        } else if (optionName === 'lang') {
          $('#lang').val(optionValue);
        } else if (optionName === 'vehicle') {
          $('#' + optionName).val(optionValue);
        } else {
          const optionValues = optionValue.split(',');
          if (optionName !== '') {
            $('#' + optionName + ' input[type="checkbox"]').each(function(i, checkbox) {
              if ($.inArray($(checkbox).val(), optionValues) !== -1) {
                $(checkbox).prop('checked', true);
              }
            });
          }
        }

      });
    }
  },
  set: function(lang, statusses, types, vehicle, modified) {
    window.location.hash =
        ('lang=' +  lang) +
        (statusses.length > 0 ? '&' + 'status=' + statusses.join(',') : '') +
        (types.length > 0 ? '&' + 'vehicleGroup=' + types.join(',') : '') +
        (vehicle.length > 0 ? '&' + 'vehicle=' + vehicle : '') +
        (modified.length > 0 ? '&' + 'modified=' + modified : '')
        // (activeIndex !== 0 ? '&' + 'index=' + activeIndex : '')
      ;
  },
  clear: function() {
    window.location.hash = '';
  }
};