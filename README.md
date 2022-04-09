# OMX2GPX
Online tool for converting track files produced by Geonaute/Decathlon ONmove 200/220 watches (typically a pair of .OMD/.OMH files) to GPX file format.

Technical informations found in the work of [Clement CORDE](https://sourceforge.net/projects/omx2gpx/)

## Try
Live demo running [here](https://spasutto.github.io/omx2gpx/omx2gpx.html).

## Usage

```html
<script src="omx2gpx.js"></script>
<script>
  const omxparser = new OMXParser();
  omxparser.addData(omh_data); // omh_data is the content of the .OMH file
  omxparser.addData(omd_data); // omd_data is the content of the .OMD file
  if (omxparser.valid) {
    console.log(omxparser.toGPX());
  }
</script>
```
You can also bypass the .OMH (header) loading but beware, the GPX file won't any have valid date.
```javascript
const omxparser = new OMXParser();
omxparser.addData(omd_data); // omd_data is the content of the .OMD file
if (omxparser.containspoints) {
  console.log(omxparser.toGPX());
}
```

## Credits
 - [omx2gpx](https://sourceforge.net/projects/omx2gpx/), C console program by Clement CORDE
