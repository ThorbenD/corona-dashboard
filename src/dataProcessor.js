function DisplayPageUnderConstructionWarning() {
    document.querySelector('html').innerHTML = `
            <!doctype html>
            <title>Site Maintenance</title>
            <style>
                body {
                    text-align: center;
                    padding: 120px;
                }


                h1 {
                    font-size: 50px;
                }

                body {
                    font: 20px Helvetica, sans-serif;
                    color: #333;
                }

                article {
                    display: block;
                    text-align: left;
                    width: 650px;
                    margin: 0 auto;
                    border-radius: 5%;
                    border: .5vw solid #F2F6FA;
                    padding: 30px;
                }
            </style>

            <article>
                <h1>Wartungsarbeiten</h1>
                <div>
                    <p>Zurzeit werden Wartungsarbeiten am Corona-Dashboard vorgenommen. Das Tool ist in Kürze wieder online!</p>
                    <p>&mdash; Stadtverwaltung Frankenthal</p>
                </div>
            </article>
        `;
}

window.onload = async function updatePage() {
    const debug = false;
    try {
        if (debug) {
            DisplayPageUnderConstructionWarning();
            return;
        }

        const response = await fetch('https://api.covid-frankenthal.de/corona?date=0', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        response.json()
            .then(json => {
                const data = json['0'];
                document.getElementById('newCases').innerText = `+ ${data['newCases'] >= 0 ? data['newCases'] : 0}`;
                document.getElementById('totalCases').innerText = `Gesamt: ${toNumberWithSeperators(data['totalCases'])} (Frankenthal)`;
                document.getElementById('newDeaths').innerText = `+ ${data['newDeaths'] >= 0 ? data['newDeaths'] : 0}`;
                document.getElementById('totalDeaths').innerText = `Gesamt: ${data['totalDeaths']} (Frankenthal)`;
                document.getElementById('vac1_percentage').innerText = `${(data['vaccination1Ratio'] * 100).toFixed(1).replace('.', ',')}%`;
                document.getElementById('vac1_value').innerText = `Gesamt: ${toNumberWithSeperators(data['vaccination1'])}`;
                document.getElementById('vac2_percentage').innerText = `${(data['vaccination2Ratio'] * 100).toFixed(1).replace('.', ',')}%`;
                document.getElementById('vac2_value').innerText = `Gesamt: ${toNumberWithSeperators(data['vaccination2'])}`;
                document.getElementById('cases7d_per_100k').innerText = data['inc7D'] >= 0 ? data['inc7D'].toFixed(1).replace('.', ',') : '-';
                document.getElementById('rValue').innerText = data['rValue'] >= 0 ? data['rValue'].toString().replace('.', ',') : '-';
                document.getElementById('incHospital').innerText = data['incHospital'] >= 0 ? data['incHospital'].toString().replace('.', ',') : '-';
                document.getElementById('intMedCapacity').innerText = data['intMedCapacity'] >= 0 ? data['intMedCapacity'].toString().replace('.', ',') : '-';

                document.getElementById('date').innerText = `Stand: ${new Date(data['date']).toLocaleDateString()}`;

                switchCase(JSON.parse(data['inc7D']), JSON.parse(data['incHospital']), JSON.parse(data['intMedCapacity']));

                fetchData()
                    .then(res => {
                        loadTableData(res);
                        chartData(res);
                    });
            });

    } catch (err) {
        DisplayPageUnderConstructionWarning();
    }
}

function switchCase(inc7d, incHospital, intMedCapacity) {
    if (/*inc7d > 200 && */incHospital > 9 /*&& intMedCapacity > 12*/) {
        changeColor(document.getElementsByClassName("body"), 'background', 'linear-gradient(to bottom, rgba(255, 64, 64, 0.3) 0%, rgba(0, 0, 0, 0) 50%)');
        changeColor(document.getElementsByClassName("collapsible-header"), 'background-color', 'rgb(255,64,64)');
        changeColor(document.getElementsByClassName("circle-indicator"), 'background-color', 'rgba(116, 0, 0, 1)');
        changeColor(document.getElementsByClassName("collapsible-frame-colored"), 'background-color', 'rgb(255,64,64)');
        document.getElementById('collapsible-title').innerText = 'Hospitalisierungsinzidenz: Über 9 (rot)';
        return;
    }

    if (/*inc7d > 100 && (*/incHospital >= 6 /*|| intMedCapacity > 6) || (incHospital >= 5 && intMedCapacity > 6)*/) {
        changeColor(document.getElementsByClassName("body"), 'background', 'linear-gradient(to bottom, rgba(255, 182, 73, 0.3) 0%, rgba(0, 0, 0, 0) 50%)');
        changeColor(document.getElementsByClassName("collapsible-header"), 'background-color', 'rgb(255,182,73)');
        changeColor(document.getElementsByClassName("circle-indicator"), 'background-color', 'rgba(251, 226, 0, 1)');
        changeColor(document.getElementsByClassName("collapsible-frame-colored"), 'background-color', 'rgb(255,182,73)');
        document.getElementById('collapsible-title').innerText = 'Hospitalisierungsinzidenz: Über 6 (orange)';
        return;
    }

    if (/*inc7d > 100 && (*/incHospital >= 3 /*|| intMedCapacity > 6) || (incHospital >= 5 && intMedCapacity > 6)*/) {
        changeColor(document.getElementsByClassName("body"), 'background', 'linear-gradient(to bottom, rgba(255, 220, 78, 0.3) 0%, rgba(0, 0, 0, 0) 50%)');
        changeColor(document.getElementsByClassName("collapsible-header"), 'background-color', 'rgb(255,220,78)');
        changeColor(document.getElementsByClassName("circle-indicator"), 'background-color', 'rgba(230, 255, 0, 1)');
        changeColor(document.getElementsByClassName("collapsible-frame-colored"), 'background-color', 'rgb(255,220,78)');
        document.getElementById('collapsible-title').innerText = 'Hospitalisierungsinzidenz: Über 3 (gelb)';
        return;
    }

    changeColor(document.getElementsByClassName("body"), 'background', 'linear-gradient(to bottom, rgba(187, 255, 0, 0.3) 0%, rgba(0, 0, 0, 0) 50%)');
    changeColor(document.getElementsByClassName("collapsible-header"), 'background-color', 'rgba(187, 255, 0, 1)');
    changeColor(document.getElementsByClassName("circle-indicator"), 'background-color', 'rgba(36, 255, 0, 1)');
    changeColor(document.getElementsByClassName("collapsible-frame-colored"), 'background-color', 'rgba(187, 255, 0, 1)');
    document.getElementById('collapsible-title').innerText = 'Hospitalisierungsinzidenz: Unter 3';
}

function changeColor(collection, element, color) {
    for (let i = 0; i < collection.length; i++) {
        collection[i].style[element] = color;
    }
}

function toNumberWithSeperators(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function fetchData() {
    let response = await fetch('https://api.covid-frankenthal.de/corona/last?days=60&projExpr=inc7D, incHospital, intMedCapacity')
        .then(r => r.json());

    return response.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function loadTableData(array) {
    const table = document.getElementById('data-table');
    array.forEach(item => {
        let row = table.insertRow();
        let dateCell = row.insertCell(0);

        let date = new Date(item.date);
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        dateCell.innerHTML = `${date.getDate()}.${months[date.getMonth()]}.${date.getFullYear()}`;

        let inc7d = row.insertCell(1);
        inc7d.innerHTML = item['inc7D'] >= 0 ? item['inc7D'].toFixed(1).replace('.', ',') : '-';
        let incHospital = row.insertCell(2);
        incHospital.innerHTML = item['incHospital'] >= 0 ? item['incHospital'].toString().replace('.', ',') : '-';
        let intMedCapacity = row.insertCell(3);
        intMedCapacity.innerHTML = item['intMedCapacity'] >= 0 ? item['intMedCapacity'].toString().replace('.', ',') : '-';
    })
    $('table').alignColumn([1], {center: ',', skipTHs: true, debug: true});
    formatTable();
}

function formatTable() {
    const rowSelector = $('#data-table > tr');
    const navSelector = $('#navigation-buttons')

    const rowsShown = 14;
    const rowsTotal = rowSelector.length;
    const numPages = rowsTotal / rowsShown;
    for (let i = 0; i < numPages; i++) {
        const pageNum = i + 1;
        navSelector.append(`<a href="#" rel="${i}">${pageNum}</a>`);
    }

    rowSelector.hide();
    rowSelector.slice(0, rowsShown).show();

    $('#navigation-buttons > a:first').addClass('active');

    $('#navigation-buttons > a').bind('click', function () {
        $('#navigation-buttons > a').removeClass('active');
        $(this).addClass('active');
        const currPage = $(this).attr('rel');
        const startItem = currPage * rowsShown;
        const endItem = startItem + rowsShown;
        rowSelector.css('opacity', '0.0').hide().slice(startItem, endItem).css('display', 'table-row').animate({opacity: 1}, 300);
    });
}

async function chartData(array) {
    array = array.reverse();
    let labels = array.map(e => e['date']);
    let values = array.map(e => e['inc7D']);

    const ctx = document.getElementById('chart_inc7d').getContext('2d');
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: '7-Tage-Inzidenz',
                    data: values,
                    backgroundColor: '#ff6384',
                    borderColor: '#ff6384',
                    borderWidth: 4,
                    tension: .3,
                },
            ],
        },
        options: {
            radius: 0,
            aspectRatio: 1.75,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        font: function (context) {
                            let width = context.chart.width;
                            let size = Math.round(width / 50);

                            return {
                                weight: 'bold',
                                size: size
                            };
                        },
                    },
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Entwicklung 7-Tage-Inzidenz (FT)',
                    font: function (context) {
                        let width = context.chart.width;
                        let size = Math.round(width / 32);

                        return {
                            weight: 'bold',
                            size: size
                        };
                    }
                }
            },
            parsing: {
                xAxisKey: 'date',
                yAxisKey: 'weekIncidence'
            },
            scales: {
                xAxis: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'd. MMM:',
                        displayFormats: {
                            day: 'd. MMM'
                        },
                    },
                    display: true,
                    grid: {
                        display: false,
                    },
                    drawTicks: false,
                    ticks: {
                        font: function (context) {
                            let width = context.chart.width;
                            let size = Math.round(width / 50);

                            return {
                                weight: 'bold',
                                size: size
                            };

                        },
                    }
                },
                yAxis: {
                    beginAtZero: true,
                    ticks: {
                        font: function (context) {
                            let width = context.chart.width;
                            let size = Math.round(width / 50);

                            return {
                                weight: 'bold',
                                size: size
                            };
                        }
                    }
                }
            },
        }
    });

    const sliders = document.getElementsByClassName('slider');
    sliders[0].value = labels.length - 14;
    sliders[1].value = labels.length;
    for (let i = 0; i < sliders.length; i++) {
        sliders[i].oninput = getValues;
        sliders[i].max = labels.length;
        sliders[i].oninput(undefined);
    }

    function getValues() {
        let min = sliders[0].value;
        let max = sliders[1].value;

        if (min > max) {
            const tmp = max;
            max = min;
            min = tmp;
        }

        let label = labels.slice(min, max);
        let value = values.slice(min, max);
        console.log(`label: ${label},  value: ${value}`);
        chart.data.labels = label;
        chart.data.datasets[0].data = value;
        chart.update();
    }
}
