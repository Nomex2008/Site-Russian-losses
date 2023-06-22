let photoMap = new Map();
let vehicleMap = new Map();
let vehicleGroupMap = new Map();
let correctPhotoUrlsMap = new Map();
const modifiedMap = new Map();

const hash = (str) => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return `${hash}`;
};

const uuid = (str) => {
  str = str.replace('-', '');
  return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c, p) {
    return str[p % str.length];
  });
};

const clear = (str) => {
  return str
    // .replace('(', '')
    // .replace(')', '')
    .replace("'", '')
    .replace("''", '')
    .replace('"', '')
    .replace("\r", '')
    .replace("\n", '')
    .replace("&nbsp;", ' ')
    .replace("(-3)", '')
    .replace("(-1)", '-1')
    .replace("'Sborka'", 'Sborka')
    .replace("(for 9K35 Strela-10)", 'for 9K35 Strela-10')
    .replace("(MRAP)", 'MRAP')
    .replace("(MRAP)", 'MRAP')
    .replace("(BDK-65)", 'BDK-65')
    .replace("(for Buk-M1-2)", 'for Buk-M1-2')
    .replace("(for Buk-M2)", 'for Buk-M2')
    .replace("(for Buk-M1/2)", 'for Buk-M1/2')
    .replace("(for Buk-M3)", 'for Buk-M3')
    .replace("(for 9K330 Tor-M)", 'for 9K330 Tor-M')
    .replace("(for 9K330 Tor)", 'for 9K330 Tor')
    .replace("(for 9K331 Tor-M1)", 'for 9K331 Tor-M1')
    .replace("(for 9K332 Tor-M2)", 'for 9K332 Tor-M2')
    .replace("(for TOS-1A)", 'for TOS-1A')
    .replace("(or variant thereof)", 'or variant thereof')
    .replace("(for 1L260 Zoopark-1M counter-battery radar complex)", 'for 1L260 Zoopark-1M counter-battery radar complex')
    .replace("(for Redut-2US signal and communications system)", 'for Redut-2US signal and communications system')
    .replace("(likely used as unmanned bait in…ne to reveal the location of air defence systems)", 'likely used as unmanned bait in…ne to reveal the location of air defence systems')
    .replace("(for BM-27 Uragan MRL)", 'for BM-27 Uragan MRL')
    .replace("(for 9K33 Osa)", 'for 9K33 Osa')

    .replace("(Unknown)", 'Unknown')
    .replace(/\u00A0/, " ")
    .replace(/\u00a0/g, " ")
    ;
};

const cleanName = (name) => {
  return name
    .replace(/\u00A0/, " ")
    .replace(/\u00a0/g, " ")
    .replace("(", "")
    .replace(")", "")
  ;
};

const uniq = (arr) => {
  return Array.from(new Set(arr))
};

const crawl = async () => {

  $('img.thumbborder').each(function (i, img) {
    const li = img.closest('li');
    const h3 = $($(li.closest('ul')).prev('h3'));
    const h3f = $(h3.prev('h3'));

    const h3text = h3 && h3[0] ? h3[0].innerText : '';
    const h3ftext = h3f && h3f[0] ? h3f[0].innerText : '';
    const vehicleGroupDesc = clear(h3ftext + h3text);
    const vehicleGroupSize = vehicleGroupDesc.split('(')[1].split(',', 1);

    const headline = h3.find('span.mw-headline');
    const vehicleGroup = clear(
      headline.length > 0 ?
      h3.find('span.mw-headline')[0].innerText.trim() :
      vehicleGroupDesc.split('(', 1).join('').trim()
    );

    let vehicle = clear(
        cleanName(li.innerText)
          .split(': ')[0]
          .trim()
    );
    let vehicleSize = vehicle.split(' ', 1);
    let parts = vehicle.split(' ');
    parts.shift();
    let vehicleName = clear(parts.join(' '));
    // const vehicleUuid = uuid(hash(vehicleName));
    // const vehicleGroupUuid = uuid(hash(vehicleGroup));

    // uuid: '${vehicleUuid}',
    // group: '${vehicleGroupUuid}'
    // if (!vehicleMap.has(vehicleName)) {
      vehicleMap.set(vehicleName, "{" + "\n" +
      `  name: '${vehicleName}',` + "\n" +
      `  size: ${vehicleSize},` + "\n" +
      `  group: '${vehicleGroup}'` + "\n" +
      '}');
    // }

    // uuid: '${vehicleGroupUuid}',
    // if (!vehicleGroupMap.has(vehicleGroup)) {
      vehicleGroupMap.set(vehicleGroup, `{` + "\n" +
      `  name: "${vehicleGroup}",` + "\n" +
      `  size: ${vehicleGroupSize},` + "\n" +
      `  description: "${vehicleGroupDesc}"` + "\n" +
      '}');
    // }

    $(li).find('a').each(function (j, a) {

      const title = clear(a.innerText);
      const titleParts = title.replace('(', '').replace(')', '').split(', ');
      const status = titleParts.pop();
      const index = titleParts.pop();
      const caption = `#${index} (${status}) ${vehicleName} of ${vehicleSize}`;
      const id = `${vehicleName}#${index}`;

      const href = correctPhotoUrlsMap.has(id) &&
        (a.href.includes("https://postimg.cc/")
          || a.href.includes("https://postlmg.cc/")) ?
        correctPhotoUrlsMap.get(id) : a.href;

      if (!photoMap.has(id)) {

        if (modifiedMap.has(href)) {

          const modified = modifiedMap.get(href);

          photoMap.set(id, '{' + "\n" +
          `  id: '${id}',` + "\n" +
          `  img: '${href}',` + "\n" +
          `  index: "${index}",` + "\n" +
          `  caption: "${caption}",` + "\n" +
          `  status: '${status}',` + "\n" +
          `  vehicle: '${vehicleName}',` + "\n" +
          `  modified: '${modified}',` + "\n" +
          '}');

        } else {

          $.ajaxSetup({
            cache: true,
            async: true
          });
          $.ajax({
              type: 'HEAD',
              url: `${href}`,
              async: false,
              complete: function(xhr) {
              // console.log(xhr.getAllResponseHeaders());
                const modified = xhr.status == 200 ?
                  xhr.getResponseHeader('last-modified') : new Date('02/24/2000');
                // const modified = new Date();
                // photoMap.push(
                // console.log(
                  photoMap.set(id, '{' + "\n" +
                  `  id: '${id}',` + "\n" +
                  `  img: '${href}',` + "\n" +
                  `  index: "${index}",` + "\n" +
                  `  caption: "${caption}",` + "\n" +
                  `  status: '${status}',` + "\n" +
                  `  vehicle: '${vehicleName}',` + "\n" +
                  `  modified: '${modified}',` + "\n" +
                  '}');
              }
          });
        }

      }
    });
  });
};

const values = (map) => {
  return Array.from(map, ([key, value]) => value)
};

// crawl();

// console.log(
//   `window.vehicleGroups = [${values(vehicleGroupMap).join(', ')}];` + "\n" +
//   `window.vehicles = [${values(vehicleMap).join(', ')}];` + "\n" +
//   `window.photos = [${values(photoMap).join(", ")}];`
// );

const generator = async () => {

  let result;

  var promise = new Promise((resolve, reject) => {

    const target = 'https://russianlosses.in.ua/js/data.js';
    $.ajaxSetup({
      cache: true,
      async: true
    });

    let result;

    $.getScript( target )
      .done(function( script, textStatus ) {

        photos.forEach(photo => {
          const {
            id,
            img,
            caption,
            status,
            vehicle,
            modified
          } = photo;

          if (!correctPhotoUrlsMap.has(id)) {
            correctPhotoUrlsMap.set(id, img);
          }

          if (!modifiedMap.has(img)) {
            modifiedMap.set(img, modified);
          }

        });

        crawl();

        result =
          `window.vehicleGroups = [${values(vehicleGroupMap).join(', ')}];` + "\n" +
          `window.vehicles = [${values(vehicleMap).join(', ')}];` + "\n" +
          `window.photos = [${values(photoMap).join(", ")}];`;

        // console.log(result);

        resolve(result);

      })
      .fail(function( jqxhr, settings, exception ) {
        console.error( "Triggered ajaxError handler." );
      });

    });

    const [results] = await Promise.all([promise]);

    return results;
};

console.log('generator added')

window.generator = generator;

// export default generator;
