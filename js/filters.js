window.Filters = {

  addCheckbox: function(containerId, name, label) {
    let container = $(containerId);
    let inputs = container.find('input');
    const index = inputs.length + 1;
    const id = containerId.replace('#', '') + '-cb-' + index;

    const div = $('<div />', {
      class: 'item'
    });
    $('<input />', {
        type: 'checkbox',
        id: id,
        value: name
    }).appendTo(div);

    $('<label />', {
      'for': id,
      html: label
    }).appendTo(div);

    div.appendTo(container);

    return id;
  },

  init: function(photos, vehicleGroups, vehicles, fotorama) {
    const self = this;
    this.photos = photos;
    this.vehicleGroups =  new Map();

    $.each(vehicleGroups, (i, vehicleGroup) => {
      self.vehicleGroups.set(vehicleGroup.name, vehicleGroup);
    });

    this.vehicles =  new Map();
    $.each(vehicles, (i, vehicle) => {
      self.vehicles.set(vehicle.name, vehicle);
    });

    this.fotorama = fotorama;

    const statusNames = ['destroyed', 'captured', 'damaged', 'abandoned'];
    $.each(statusNames, function(i, statusName) {

      self.addCheckbox(
        '#status',
        statusName,
        `<span class="trn">${statusName}</span>`
      );
    });

    $.each(vehicleGroups, function(i, vehicleGroup) {
        self.addCheckbox(
            '#vehicleGroup',
            vehicleGroup.name,
            `<span class="trn">${vehicleGroup.name}</span> (${vehicleGroup.size})`
        );
    });

    modifiedFilter.init();

    Hash.init();
  },
  apply: function() {
    let filteredPhotos = this.photos;
    let appliedStatusses = [];

    Loading.start();

    $('#status input[type="checkbox"]').each(function(i, checkbox) {
        if($(checkbox).is(":checked")){
          appliedStatusses.push($(checkbox).val());
        }
    });
    appliedStatusses = $.unique(appliedStatusses);
    if (appliedStatusses.length > 0) {

      filteredPhotos = filteredPhotos.filter(function (photo) {
        let result = false;
        $.each(appliedStatusses, function(j, appliedStatus) {
          if (photo.status.includes(appliedStatus)) {
            result = true;
          }
          if (result === true) {
            return false; // break
          }
        });
        return result;
      });
    }

    const appliedGroups = [];
    $('#vehicleGroup input[type="checkbox"]').each(function(i, checkbox) {
        if($(checkbox).is(":checked")){
          appliedGroups.push($(checkbox).val());
        }
    });
    const self = this;
    if (appliedGroups.length > 0) {
        filteredPhotos = filteredPhotos.filter(function (photo) {
          let result = false;
          const vehicle = self.vehicles.get(photo.vehicle);
          if (!vehicle) {
            console.error(photo);
            return false;
          }
          const group = self.vehicleGroups.get(vehicle.group);
          if (!group) {
            console.error(vehicle);
            return false;
          }
          $.each($.unique(appliedGroups), function(k, appliedGroup) {
            if (group.description.includes(appliedGroup)) {
              result = true;
            }
            if (result === true) {
              return false; // break
            }
          });
          return result;
        });
    }

    const vehicleName = $('#vehicle').val();
    if (vehicleName.length > 2) {
        filteredPhotos = filteredPhotos.filter((photo) => {
          return photo.vehicle.includes(vehicleName);
        });
    }

    filteredPhotos = modifiedFilter.apply(filteredPhotos);

    if ($('#sort').val() === 'desc') {
      filteredPhotos = filteredPhotos.sort((a,b) => {
        return new Date(b.modified) - new Date(a.modified);
      });
    }

    $.each(filteredPhotos, (i, photo) => {
      if (photo.index) {
        const vehicle = self.vehicles.get(photo.vehicle);
        if (vehicle) {
          const group = self.vehicleGroups.get(vehicle.group);
          if (group) {
            photo.caption = `#${photo.index} (${photo.status}) ${photo.vehicle} of ${vehicle.size} [${group.name} ${group.size}]`;
          }
        }
      }
    });

    filteredPhotos = filteredPhotos.filter((photo) => {
      return !photo.img.includes('https://twitter.com/');
    });

    this.fotorama.load(filteredPhotos);
    // if (filteredPhotos.length > 0) {
      const activeIndex = $('#index').val();
      $('#index').val(0);
      this.fotorama.show({
        index: activeIndex,
        time: 300
      });
    // }
    $('#size').html(filteredPhotos.length);

    Hash.set(
      $('#lang').val(),
      appliedStatusses,
      appliedGroups,
      vehicleName,
      modifiedFilter.hash()
    );

    Loading.stop();
  }
};