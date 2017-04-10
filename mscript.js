class MapData extends React.Component{
  componentDidMount () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const div = d3.select('.mapdata')
                  .append('div')
                  .attr('class', 'tooltip1');

    const svg = d3.select('.mapdata')
                  .append("div")
                 // .classed("svg-container", true) //container class to make it responsive; no need; 
                  .append('svg')
                  .attr("preserveAspectRatio", "xMinYMin meet")//resize window;
                  .attr("viewBox", "0 0 "+w+" "+h) //resize window;
                  //.classed("svg-content-responsive", true)//class to make it responsive; no need;
                  //.attr('width', w)//cannot use this if set responsive/resize;
                  //.attr('height', h)//cannot use this if set responsive/resize;
                  .call(d3.zoom().on("zoom", ()=> {
                    d3.event.transform.x = Math.min(0, Math.max(d3.event.transform.x, w - w * d3.event.transform.k));
                    d3.event.transform.y = Math.min(0, Math.max(d3.event.transform.y, h - h * d3.event.transform.k));
                    svg.attr("transform", d3.event.transform);
                    }))
                  ;

    const projection = d3.geoMercator()
                         .scale(220)
                         .translate([w/2, h/2]);

    const path = d3.geoPath()
                   .projection(projection);
        
    //get map;
    $.getJSON("https://d3js.org/world-50m.v1.json", data=>{
      svg.append('g')
         .selectAll('path')
         .data(topojson.feature(data, data.objects.countries).features)
         .enter()
         .append('path')
         .attr('fill', '#71945A')
         .attr('stroke', 'white')
         .attr('d', path);
         
         
         //get meteorites;
      $.getJSON("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", data=>{
        
        const meteoData=data.features;
        console.log(meteoData)
        const hueScale = d3.scaleLinear()
                           .domain([0, 5000000])
                        .range([0, 5000000])
                        .clamp(true);
        const scale = d3.scaleLinear()
                        .domain([0, 5000000])
                        .range([3, 50])
                        .clamp(true);
        let isHovered = false;
        let  range = 718750/2/2;// to set up bigger mass's circle opacity to 0.5 which is over this range, otherwise opacity is 1; 
        svg.append('g')
           .selectAll('circle')
           .data(meteoData)
           .enter()
           .append('circle')
           .attr('cx', d => projection([d.properties.reclong, d.properties.reclat])[0])
           .attr('cy', d => projection([d.properties.reclong, d.properties.reclat])[1])
           .attr('r', d => d.properties.mass ? scale(parseInt(d.properties.mass)) : scale(0))  
           //.attr('fill', d=> d.properties.mass ? 'hsl(' + hueScale(parseInt(d.properties.mass)) + ',100%, 50%)' : 'hsl(' + hueScale(0) + ',100%, 50%)')//mass value null shows red color;
           .attr('fill', d=> 'hsl(' + hueScale(parseInt(d.properties.mass)) + ',100%, 50%)')//mass value null shows black color;
           .style('fill-opacity', d=> d.properties.mass <= range ? 1 : 0.5)
           .attr('stroke-width', 1)
           .attr('stroke', '#323232')
           .on('mouseover', function(d){
              d3.select(this)
              .attr('r', d => d.properties.mass ? scale(parseInt(d.properties.mass))*1.2 : scale(0)*1.2);

              let lat=d.properties.reclat;
              let long=d.properties.reclong;
              let goUrl='https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&sensor=true';
              let x1=(d3.event.pageX+32) + 'px';
              let y1=(d3.event.pageY-90) + 'px';

              isHovered=true;

              d3.json(goUrl,data=>{
                if(!isHovered) return;//to prevent player moves too fast and tooltip stays there; prevent mouseout event happens before json-location-service fired;
                  let location=data.results[0] ? data.results[0].formatted_address : 'latitude: '+lat+', longitude: '+long;
                div.html('Name: '+d.properties.name+'<br>Class: '+d.properties.recclass
                  +'<br>Mass: '+(d.properties.mass ? d.properties.mass : 'unknown')+'<br>Year: '+d.properties.year.slice(0,4)+
                  '<br>Location: '+ location)
                   .style('left', x1)
                   .style('top', y1)
                   .style('display', 'block')
                   .style('position', 'absolute');
              })
            })
           .on('mouseout', function(d) {
              isHovered=false;
              div.style('display', 'none');

              d3.select(this)
                .attr('r', d => d.properties.mass ? scale(parseInt(d.properties.mass)) : scale(0));
            })          
      })
    })    
  }

  render () {
    return (
      <div className='mapdata'>
      </div>
    )
  }
}

ReactDOM.render(<MapData/>,
  document.getElementById('app'));
