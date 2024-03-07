// マップとスライダーを初期化する
var mapInstance = initializeMap();
var sliderInstance = initializeSlider();

// マーカーを格納する配列を作成する
var markers = [];

// "sample.csv" ファイルを取得する
fetch('Testfile.csv')
    .then(response => response.text())
    .then(data => {
        // CSVデータをパースする
        var rows = data.split('\n');
        var headers = rows[0].split(',');

        // 各列のインデックスを取得する
        var areaIndex = headers.indexOf('エリア');
        var powerCompanyIndex = headers.indexOf('発電事業者');
        var powerPlantNameIndex = headers.indexOf('発電所名');
        var powerTypeIndex = headers.indexOf('発電形式');
        var unitNameIndex = headers.indexOf('ユニット名');
        var approvedOutputIndex = headers.indexOf('認可出力');
        var stopCategoryIndex = headers.indexOf('停止区分');
        var stopTypeIndex = headers.indexOf('停止種別');
        // var decreaseAmountIndex = headers.indexOf('低下量');
        var stopDateTimeIndex = headers.indexOf('停止日時');
        var recoveryProspectIndex = headers.indexOf('復旧見通し');
        var scheduledRecoveryDateIndex = headers.indexOf('復旧予定日');
        var stopCauseIndex = headers.indexOf('停止原因');
        var latIndex = headers.indexOf('北緯');
        var lngIndex = headers.indexOf('東経');

        rows.slice(1).forEach(row => {
            var columns = row.split(',');

            var lat = parseFloat(columns[latIndex]);
            var lng = parseFloat(columns[lngIndex]);

            var powerPlantName = columns[powerPlantNameIndex];
            var powerDate = new Date(columns[stopDateTimeIndex]);
            var powerCompany = columns[powerCompanyIndex];
            var plantType = columns[powerTypeIndex];
            var approvedOutput = columns[approvedOutputIndex];
 


            var info = "発電事業者: " + powerCompany + "<br>" +
                       "発電形式: " + plantType + "<br>" +
                       "ユニット名: " + columns[unitNameIndex] + "<br>" +
                       "認可出力: " + numberWithCommas(approvedOutput) + " kW" + "<br>" + "<br>" +
                       "停止日時: " + columns[stopDateTimeIndex] + "<br>" +
                       "停止区分: " + columns[stopCategoryIndex] + "<br>" +
                       "種別: " + columns[stopTypeIndex] + "<br>" +
                       "停止原因: " + columns[stopCauseIndex] + "<br>" +"<br>" +
                       "復旧見通し: " + columns[recoveryProspectIndex] + "<br>" +
                       "復旧予定日: " + columns[scheduledRecoveryDateIndex];

            // 認可出力を数値として返還
            function numberWithCommas(number) {
                return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } 

            var marker = createMarker(lng, lat, powerPlantName, info, plantType);
            markers.push({ marker: marker, date: powerDate });
        });

        drawMarkers();
    });

// マップを初期化する関数
function initializeMap() {
    return new maplibregl.Map({
        container: 'map',
        style: 'https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/blank.json',
        center: [138.1073422594075, 37.12047581846384],
        zoom: 4.4
    });
}


// マーカーを作成する関数
function createMarker(lng, lat, name, info, plantType) {
    var color;
    switch (plantType) {
        case '水力':
            color = 'blue';
            break;
        case '原子力':
            color = 'yellow';
            break;
        case '地熱':
            color = 'brown';
            break;
        case 'バイオマス':
            color = 'green';
            break;
        default:
            color = 'red';
    }

    var marker = new maplibregl.Marker({ color: color, scale: 0.4 })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setHTML('<h3>' + name + '</h3><p>' + info + '</p>'));

    return marker;
}

// スライダーを初期化する関数
function initializeSlider() {
    var start = new Date("2023-01-01");
    var end = new Date("2024-03-01");
    var diff = end - start;

    return $("#slider").slider({
        range: true,
        min: 0,
        max: 365,
        values: [0, 365],
        slide: function(event, ui) {
            var date1 = new Date(start.getTime() + diff * ui.values[0] / 365);
            var date2 = new Date(start.getTime() + diff * ui.values[1] / 365);
            $("#date").text(date1.toISOString().slice(0,10) + " - " + date2.toISOString().slice(0,10));

            drawMarkers();
        }
    });
}

// スライダーの日付に基づいてマーカーを描画する関数
function drawMarkers() {
    var sliderDates = $("#date").text().split(" - ");
    var startDate = new Date(sliderDates[0]);
    var endDate = new Date(sliderDates[1]);

    markers.forEach(item => {
        var marker = item.marker;
        var date = item.date;

        if (date >= startDate && date <= endDate) {
            if (!marker._addedToMap) {
                marker.addTo(mapInstance);
                marker._addedToMap = true;
            }
        } else {
            if (marker._addedToMap) {
                marker.remove();
                marker._addedToMap = false;
            }
        }
    });
}


// デフォルトの日付範囲を設定する関数
function setDefaultDateRange() {
    var start = new Date("2023-02-01");
    var end = new Date("2024-02-01");
    var diff = end - start;
    var defaultStartDate = new Date(start.getTime() + diff * 0 / 365);
    var defaultEndDate = new Date(start.getTime() + diff * 365 / 365);
    $("#date").text(defaultStartDate.toISOString().slice(0,10) + " - " + defaultEndDate.toISOString().slice(0,10));
}

// 初期化時にデフォルトの日付範囲を設定する
setDefaultDateRange();
