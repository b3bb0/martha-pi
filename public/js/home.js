$.ajax({
  url: '/logs.csv',
  type: "GET",
  success: render
});


function render(csv) {
  var dates =[];
  var humi = [];
  var temp = [];
  csv.split("\n").forEach(function(l) {
    if (l.trim().length<1) return;
    info = l.split(",");
    dates.push( new moment(parseInt(info[0])) );
    humi.push( parseInt(info[1]) );
    temp.push( parseInt(info[2]) );
  });
  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    options: {
        title: {
            display: true,
            text: 'Martha history log'
        },
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        stacked: false,
        scales: {
          xAxes: [{
            type: 'time',
            time: { tooltipFormat: 'YYYY-MM-DD HH:mm', },
            //time: {
            //  unit: 'minute',
            //}
            //time: { unit: 'day' }
          }],
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 10,
            max: 40,
          },
          
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 70,
            max: 100,
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        }
      },
    data: {
      labels: dates, // [1,2,3,4,5,6,7,8,9,10],
      datasets: [{ 
          data: temp, //[20,20,20,20,20,20,20,20,20,20],
          label: "Temperature",
          borderColor: "#3e95cd",
          yAxisID: 'y',
          cubicInterpolationMode: 'monotone',
          tension: 0.4
        }, { 
          data: humi, // [90,90,90,90,90,90,90,90,90,90],
          label: "Humidity",
          borderColor: "#8e5ea2",
          yAxisID: 'y1',
          cubicInterpolationMode: 'monotone',
          tension: 0.4
        }
      ]
    }
  });

}
