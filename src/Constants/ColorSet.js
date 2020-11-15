export default [
  ["b8bdc2","concrete","0"],
  ["c75702","concrete","1"],
  ["952a90","concrete","2"],
  ["1f79b4","concrete","3"],
  ["d39a13","concrete","4"],
  ["529416","concrete","5"],
  ["bd5981","concrete","6"],
  ["303237","concrete","7"],
  ["6f6f69","concrete","8"],
  ["13697b","concrete","9"],
  ["581b8d","concrete","10"],
  ["272981","concrete","11"],
  ["56351d","concrete","12"],
  ["405020","concrete","13"],
  ["7e1c1d","concrete","14"],
  ["06080d","concrete","15"],
  ["c3a596","stained_hardened_clay","0"],
  ["974d21","stained_hardened_clay","1"],
  ["8c5366","stained_hardened_clay","2"],
  ["686580","stained_hardened_clay","3"],
  ["ae7d21","stained_hardened_clay","4"],
  ["5c6a2f","stained_hardened_clay","5"],
  ["984a4b","stained_hardened_clay","6"],
  ["352621","stained_hardened_clay","7"],
  ["7c6259","stained_hardened_clay","8"],
  ["525657","stained_hardened_clay","9"],
  ["724453","stained_hardened_clay","10"],
  ["473956","stained_hardened_clay","11"],
  ["482f21","stained_hardened_clay","12"],
  ["464d27","stained_hardened_clay","13"],
  ["7f3727","stained_hardened_clay","14"],
  ["22150f","stained_hardened_clay","15"],
  ["c4c8cd","wool","0"],
  ["dc711a","wool","1"],
  ["b348ae","wool","2"],
  ["40acce","wool","3"],
  ["daaa1e","wool","4"],
  ["68a817","wool","5"],
  ["cb6a8d","wool","6"],
  ["363a3f","wool","7"],
  ["878785","wool","8"],
  ["136b7c","wool","9"],
  ["792ca6","wool","10"],
  ["3744a1","wool","11"],
  ["633e23","wool","12"],
  ["4b6117","wool","13"],
  ["89201e","wool","14"],
  ["1d1c21","wool","15"]
];

// let [r, g, b] = [data[i], data[i + 1], data[i + 2]];
// if(i === 0) console.log(r,g,b);
// let diff = 1e20;
// ColorSet.forEach(x => {
//   const [R, G, B] = hex2rgb(x[0]);
//   const d = (R - r) ** 2 + (G - g) ** 2 + (B - b) ** 2;
//   if( d < diff ) {
//     diff = d;
//     [r, g, b] = [R, G, B];
//   }
// });
// if(i === 0) console.log(r,g,b);
//
// [data[i], data[i + 1], data[i + 2]] = [r, g, b];

// export default [
//   ["1","64","33","wool","14"],
//   ["11","53","33","stained_hardened_clay","14"],
//   ["15","16","42","stained_hardened_clay","8"],
//   ["15","23","17","stained_hardened_clay","7"],
//   ["19","39","10","stained_hardened_clay","15"],
//   ["20","27","68","stained_hardened_clay","0"],
//   ["22","37","21","stained_hardened_clay","12"],
//   ["22","64","36","stained_hardened_clay","1"],
//   ["25","48","26","wool","12"],
//   ["25","50","23","concrete","12"],
//   ["26","98","39","concrete","1"],
//   ["27","79","48","wool","1"],
//   ["39","68","41","stained_hardened_clay","4"],
//   ["42","83","45","concrete","4"],
//   ["45","76","49","wool","4"],
//   ["60","1","53","wool","8"],
//   ["60","3","42","concrete","8"],
//   ["71","33","23","stained_hardened_clay","13"],
//   ["74","39","30","stained_hardened_clay","5"],
//   ["78","62","24","wool","13"],
//   ["80","43","22","concrete","13"],
//   ["86","76","37","wool","5"],
//   ["91","74","33","concrete","5"],
//   ["190","73","28","concrete","9"],
//   ["192","3","33","stained_hardened_clay","9"],
//   ["194","59","53","wool","3"],
//   ["204","71","41","concrete","3"],
//   ["210","8","74","concrete","0"],
//   ["213","8","23","wool","7"],
//   ["213","8","79","wool","0"],
//   ["223","7","20","concrete","7"],
//   ["223","37","4","concrete","15"],
//   ["233","49","42","wool","11"],
//   ["239","54","33","concrete","11"],
//   ["247","12","45","stained_hardened_clay","3"],
//   ["252","8","12","wool","15"],
//   ["269","20","28","stained_hardened_clay","11"],
//   ["272","68","33","concrete","10"],
//   ["278","58","41","wool","10"],
//   ["303","43","49","wool","2"],
//   ["303","56","37","concrete","2"],
//   ["336","43","55","concrete","6"],
//   ["338","48","61","wool","6"],
//   ["340","25","36","stained_hardened_clay","10"],
//   ["340","26","44","stained_hardened_clay","2"],
//   ["359","35","44","stained_hardened_clay","6"],
//   ["359","64","30","concrete","14"],
// ];

// let [h, s, l] = rgb2hsl([data[i], data[i + 1], data[i + 2]]);
// let result = [h, s, l];
// for(let i = 0; i < ColorSet.length; i++) {
//   if(ColorSet[i][0] < h) continue;
//   else {
//     if(i === 0) {
//       result = [ColorSet[0][0], ColorSet[0][1], ColorSet[0][2]];
//       break;
//     }
//     if(ColorSet[i][0] - h > h - ColorSet[i - 1][0]) {
//       result = [ColorSet[i - 1][0], ColorSet[i - 1][1], ColorSet[i - 1][2]];
//       break;
//     }
//     else {
//       result = [ColorSet[i][0], ColorSet[i][1], ColorSet[i][2]];
//       break;
//     }
//   }
// }
// [data[i], data[i + 1], data[i + 2]] = hsl2rgb(result);
