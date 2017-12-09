
var app = angular.module('myApp', ['ngAnimate']);

app.controller('myCtrl', function ($scope, $http) {

    var DISPLAY_PERIOD = 100;
    var AWS_API = true;
    var VIEW_ERR = -1;
    var VIEW_NONE = 0;
    var VIEW_RESULT = 1;
    var VIEW_PROG = 2;
    var EXPORT_URL = 'http://export.highcharts.com/';

    $scope.infoData = [];
    $scope.idxData = [];
    $scope.histData = [];
    $scope.newsData = null;
    $scope.stocksymbol = ""; // binding to html form input
    $scope.showFavorites = true;
    $scope.showProgressBarInfo = true;
    $scope.showProgressBarIdx = true;
    $scope.showProgressBarNews = true;
    $scope.showInfoView = VIEW_NONE;
    $scope.showIdxView = VIEW_NONE;
    $scope.showHistView = VIEW_NONE;
    $scope.showNewsView = VIEW_NONE;
    $scope.arrowlink = "";
    $scope.startSearch = false;
    $scope.priceChart = null;
    $scope.priceChartUrl = '';
    $scope.chartOptionArray = [];
    $scope.chartShowArray = [];

    /**
     *  FB Sharing SDK init()
     */
    window.fbAsyncInit = function() {
        FB.init({
            appId            : '285904121931103', // my fb app id TODO: should hide this part
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.11'
        });
    };
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    /**
     *  Search Button:
     *      Send the request to php server to get JSON files
     *      at the same time, callback the correspond function to show table and draw highchart
     */
    $scope.searchClicked = function () {
        if ($scope.stocksymbol === '' || $scope.stocksymbol === null) {
            alert('Input error');
            return;
        }
        $scope.startSearch = true;
        $scope.showInfoView = VIEW_PROG;
        $scope.showIdxView = VIEW_PROG;
        $scope.showHistView = VIEW_PROG;
        $scope.showNewsView = VIEW_PROG;
        rightArrowClick();

        console.log(getRequestUrl());

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=infoArray&type=INFO'
        }).then(function successCallback(response) {

                    //$scope.infoData = processInfoData(response.data);
                    $scope.infoData = response.data['Data']; // get whole json~
                    $scope.showProgressBarInfo = false;
                    $scope.showInfoView = VIEW_RESULT;
                    if ($scope.infoData) {
                        getChangeArrow($scope.infoData['change']);
                    }

            }, function errorCallback(response) {
                requestDataErrorCallBack('infoArray');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=Price'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    // TODO: remove all error handling in successCallback
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['Price'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawChart('price');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                // TODO: Separate the view of every indicator
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=SMA'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['SMA'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawSMA('SMA');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=EMA'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['EMA'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawEMA('EMA');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=RSI'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['RSI'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawRSI('RSI');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=ADX'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['ADX'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawADX('ADX');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=CCI'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['CCI'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawCCI('CCI');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=STOCH'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['STOCH'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawStoch('STOCH');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=BBANDS'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['BBANDS'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawBBANDS('BBANDS');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=MACD'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('idx');
                } else {
                    $scope.idxData['MACD'] = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawMACD('MACD');
                    $scope.showIdxView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('idx');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=indicators&type=HIST'
        }).then(function successCallback(response) {
                if (response.data['Error']) {
                    requestDataErrorCallBack('hist');
                } else {
                    $scope.histData = response.data['Data']; // get whole json~
                    $scope.showProgressBarIdx = false;
                    drawHistorical();
                    $scope.showHistView = VIEW_RESULT;
                }
            }, function errorCallback(response) {
                requestDataErrorCallBack('hist');
            }
        );

        $http({
            method: 'Get', url: getRequestUrl() + '&batch=news&type=News'
        }).then(function successCallback(response) {
                $scope.newsData = response.data['Data']; // get whole json~
                $scope.showProgressBarNews = false;
                $scope.showNewsView = VIEW_RESULT;
            }, function errorCallback(response) {
                requestDataErrorCallBack('news');
            }
        );

    };

    $scope.rightArrowClicked = function () {
        $scope.showFavorites = false;
    };

    $scope.leftArrowClicked = function () {
        $scope.showFavorites = true;
    };

    $scope.clearClicked = function () {

        clearSearchData();

        $scope.startSearch = false;

        // Set back to show progress bar first
        $scope.showInfoView = VIEW_NONE;
        $scope.showIdxView = VIEW_NONE;
        $scope.showHistView = VIEW_NONE;
        $scope.showNewsView = VIEW_NONE;
        $scope.showProgressBarInfo = true;
        $scope.showProgressBarIdx = true;
        $scope.showProgressBarNews = true;

        //localStorage.clear();
    };

    /**
     * FB Sharing Button
     * Don't forget the initial part
     * */
    $scope.shareFbClicked = function () {
        // TODO: Set different option to get different chart
        // element.hasClass('active') ?
        requestExportingChart($scope.chartOptionArray['Price']);
    };


    /**
     *  Favorite Part
     *
     */
    // keep track of favorites
    $scope.favorites = (localStorage.getItem('favorites') !== null) ? JSON.parse(localStorage.getItem('favorites')) : {};

    // TODO: this part is about Favorite
    $scope.isFavorite = function (node) {

        for (const favoriteId in $scope.favorites) {
            //console.log("s/f:" + $scope.stocksymbol + "/" + favoriteId);
            if (node === favoriteId) { // use == because node.id is int while favoriteId is string
                return true;
            }
        }
        return false;
    };

    $scope.toggleFavorite = function (node) {
        if ($scope.isFavorite(node)) {
            $scope.unsetFavorite(node);
        } else {
            $scope.setFavorite(node);
        }

        console.log($scope.favorites);

    };

    $scope.setFavorite = function (node) {
        $scope.favorites[node] = $scope.infoData;
        $scope.favorites[node].savetime = new Date().valueOf(); // put the timestamp for sorting
        //$scope.favorites[$scope.stocksymbol] = $scope.infoData;
        //$scope.favorites[$scope.stocksymbol].savetime = new Date().valueOf(); // put the timestamp for sorting
        //$scope.favorites[Number($scope.stocksymbol)] = $scope.infoData;
        //$scope.favorites[Number($scope.stocksymbol)].type = $scope.activeType;

        // save to localStorage
        // https://www.w3schools.com/html/html5_webstorage.asp
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
        // Example of using JSON.stringify() with localStorage
        localStorage.setItem('favorites', JSON.stringify($scope.favorites));
    };

    $scope.unsetFavorite = function (node) {
        //delete $scope.favorites[$scope.stocksymbol];
        delete $scope.favorites[node];
        localStorage.setItem('favorites', JSON.stringify($scope.favorites));
    };


    function getRequestUrl() {
        var query_url = 'http://localhost:8888/hw8/stock_search.php?stocksymbol=' + $scope.stocksymbol + '&btn_submit=Search';

        if (AWS_API) {
            query_url = 'http://stocksearch-weichi-env.us-west-1.elasticbeanstalk.com/stock_search.php?stocksymbol=' + $scope.stocksymbol + '&btn_submit=Search';
        }

        return query_url;
    }





    function clearSearchData() {
        $scope.stocksymbol = '';
        $scope.infoData = [];
        $scope.idxData = [];
        $scope.histData = [];
        $scope.newsData = null;
    }

    function rightArrowClick() {
        $scope.showFavorites = false;
    }

    function getViewConstant(str) {
        var rst = VIEW_NONE;
        switch(str) {
            case "result":
                rst = VIEW_RESULT;
                break;
            case "prog":
                rst = VIEW_PROG;
                break;
            case "err":
                rst = VIEW_ERR;
                break;
            default:
                rst = VIEW_NONE;
        }
        return rst;
    }

    function requestDataErrorCallBack(myView) {

        if (myView === 'infoArray')
            $scope.showInfoView = VIEW_ERR;
        if (myView === 'idx')
            $scope.showIdxView = VIEW_ERR;
        if (myView === 'hist')
            $scope.showHistView = VIEW_ERR;
        if (myView === 'news')
            $scope.showNewsView = VIEW_ERR;
    }

    function getChangeArrow(change) {
        $scope.arrowlink = "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png";
        //"http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png"
        //"http://cs-server.usc.edu:45678/hw/hw8/images/Up.png"
        if (change < 0) {
            $scope.arrowlink = "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
            //"http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png"
            //"http://cs-server.usc.edu:45678/hw/hw8/images/Down.png"
        }
    }

    function processInfoData(inputData) {
        // TODO: if can process the data here, can reduce the request.
        /*
        var proData = [];


        var dayArray = [];


        for (var i = 0 ; i < inputData["Time Series (Daily)"].length ; i++) {
            dayArray.append()
        }

        foreach ($this->stsd["Time Series (Daily)"] as $key => $value) {
            array_push($this->dayArray, $value);
        }

        proData['close'] = round(dayArray[0]["4. close"], 2);
        proData['open'] = round($this->dayArray[0]["1. open"], 2);
        proData['pclose'] = round($this->dayArray[1]["4. close"], 2);
        proData['change'] = round($this->infoArray['close'] - $this->infoArray['pclose'], 2);
        proData['percent'] = (round((($this->infoArray['close'] - $this->infoArray['pclose']) / $this->infoArray['pclose']) * 100, 2)) . '%';
        proData['range'] = "" . $this->dayArray[0]["3. low"] . "-" . $this->dayArray[0]["2. high"];
        proData['volume'] = $this->dayArray[0]["5. volume"];
        proData['timestamp'] = date("Y-m-d", strtotime($this->stsd['Meta Data']["3. Last Refreshed"]));


        return proData;*/
    }

    /** --- FB Sharing related --- */
    function requestExportingChart (option) {
        var imageURL = '';

        var optionsStr = JSON.stringify(option);
        var dataString = encodeURI('async=true&type=png&width=550&options=' + optionsStr);
        if (window.XDomainRequest) {
            var xdr = new XDomainRequest();
            xdr.open("post", EXPORT_URL+ '?' + dataString);
            xdr.onload = function () {
                console.log(xdr.responseText);
                imageURL = EXPORT_URL + xdr.responseText;
                shareToFB(imageURL);
                //$('#container').html('<img src="' + exporturl + xdr.responseText + '"/>');
            };
            xdr.send();
        } else {
            $.ajax({
                type: 'POST',
                data: dataString,
                url: EXPORT_URL,
                success: function (data) {
                    console.log('get the file from relative url: ', data);
                    imageURL += EXPORT_URL + data;
                    shareToFB(imageURL);
                },
                error: function (err) {
                    debugger;
                    console.log('error', err.statusText)
                }
            });
        }
        return imageURL;
    }

    function shareToFB (url) {
        var settings = {
            method: 'share',
            href: url
        };

        FB.ui(settings, function(response){
            /*if (response && response.post_id) {
                // There will be a response.post_id if the person actually publishes
                // We could trigger an event to Google Analytics or similar if we wanted to keep track of # of shares
                // alert('Post was published.')
            } else {
                // They clicked and opened the dialog box, but did not publish it
                alert('Post was not published.');
            }*/
        });
    }


    /** --- All the draw functions --- */
    function drawHistorical() {

        var hist_data = $scope.histData;

        $(function() {
            Highcharts.stockChart('page_historical', {
                title: {
                    text: $scope.stocksymbol + ' Stock Value'
                },
                subtitle: {
                    text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
                },

                xAxis: {
                    gapGridLineWidth: 0,
                    minRange: 3600 * 1000
                },

                rangeSelector: {
                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '1D'
                    }, {
                        type: 'week',
                        count: 1,
                        text: '1W'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'ytd',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        count: 1,
                        text: 'All'
                    }],
                    selected: 1,
                    inputEnabled: false
                },

                series: [{
                    name: $scope.stocksymbol,
                    type: 'area',
                    data: hist_data.reverse(),
                    gapSize: 5,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    //threshold: null,
                    turboThreshold: 0
                }]
            });
        });
    }


    function drawChart(indicator) {

        //var api = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&outputsize=full&apikey=ZL22LW5MLYK0W7I4";
        //var indicator_text = loadXML(api);
        //var indicator_json = JSON.parse(indicator_text);
        var indicator_json = [];
        indicator_json = $scope.idxData['Price'];
        // actually this can get the data


        var dayPriceSeries = [];
        var dayVolumeSeries = [];
        var dateArray = [];
        var count = 0;

        for(var key in indicator_json["Time Series (Daily)"]) {

            var p = parseFloat(indicator_json["Time Series (Daily)"][key]["4. close"]);
            var v = parseFloat(indicator_json["Time Series (Daily)"][key]["5. volume"]); // for M

            dayPriceSeries.push(p);
            dayVolumeSeries.push(v);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        $scope.priceChartOption = {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Price and Stock (' + new Date().toLocaleDateString('en-US')+ ')'
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: [{
                title: {
                    text: 'Stock Price'
                },
                labels: {
                    enabled: true
                }
            },{
                title: {
                    text: 'Volume'
                },
                labels: {
                    formatter: function() {
                        return (this.value)/1000000 + 'M';
                    },
                    enabled: true
                },
                opposite:true
            }],
            plotOptions: {
                labels: {
                    enabled: false,
                },
                line: {
                    enableMouseTracking: false
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },

            // Input data
            series: [{
                yAxis: 0,
                title: {
                    text: 'Stock Price'
                },
                labels: {
                    enabled: false,
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["2. Symbol"],
                type: 'area',
                color: '#322dff',
                data: dayPriceSeries.reverse()

            }, {
                yAxis: 1,
                title: {
                    text: 'Volume'
                },
                labels: {
                    enabled: false
                },
                name: indicator_json['Meta Data']["2. Symbol"] + " Volume",
                type: 'column',
                color: '#ff4534',
                data: dayVolumeSeries.reverse()
            }]
        };

        $scope.priceChart = new Highcharts.chart('page_idx_price', $scope.priceChartOption);
        $scope.chartOptionArray['Price'] = $scope.priceChartOption;
        //requestExportingChart($scope.priceChartOption);
        //console.log("test url:" + $scope.priceChartUrl);
    }

    function drawSMA(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['SMA'];

        var dataSeries = [];
        var dateArray = [];
        var count = 0;


        for(var key in indicator_json["Technical Analysis: SMA"]) {

            var v = parseFloat(indicator_json["Technical Analysis: SMA"][key]["SMA"]);
            dataSeries.push(v);
            dateArray.push(key);
            //console.log("check:" +v);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_sma', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false

                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"],
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse(),
                allowPointSelect: true
            }]
        });
    }

    function drawEMA(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['EMA'];

        var dataSeries = [];
        var dateArray = [];
        var count = 0;


        for(var key in indicator_json["Technical Analysis: EMA"]) {

            var v = parseFloat(indicator_json["Technical Analysis: EMA"][key]["EMA"]);
            dataSeries.push(v);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_ema', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"],
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse()

            }]
        });
    }

    function drawRSI(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['RSI'];

        var dataSeries = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key][indicator]);
            dataSeries.push(v);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_rsi', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"],
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse()

            }]
        });
    }

    function drawADX(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['ADX'];

        var dataSeries = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key][indicator]);
            dataSeries.push(v);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_adx', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"],
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse()

            }]
        });
    }

    function drawCCI(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['CCI'];

        var dataSeries = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key][indicator]);
            dataSeries.push(v);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_cci', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"],
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse()

            }]
        });
    }

    function drawBBANDS(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['BBANDS'];

        var dataSeries = [];
        var dataSeries2 = [];
        var dataSeries3 = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key]["Real Lower Band"]);
            var v2 = parseFloat(indicator_json[ta_title][key]["Real Middle Band"]);
            var v3 = parseFloat(indicator_json[ta_title][key]["Real Upper Band"]);
            dataSeries.push(v);
            dataSeries2.push(v2);
            dataSeries3.push(v3);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_bbands', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"] + ' Real Middle Band',
                type: 'line',
                color: '#F66464',

                data: dataSeries2.reverse()

            },{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"] + ' Real Upper Band',
                type: 'line',
                color: '#0d0d4f',

                data: dataSeries3.reverse()

            },
                {
                    labels: {
                        enabled: false
                    },
                    tooltip: {
                        valueDecimals: 2
                    },
                    name: indicator_json['Meta Data']["1: Symbol"] + ' Real Lower Band',
                    type: 'line',
                    color: '#58f613',

                    data: dataSeries.reverse()

                }]
        });
    }

    function drawMACD(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['MACD'];

        var dataSeries = [];
        var dataSeries2 = [];
        var dataSeries3 = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key]["MACD_Signal"]);
            var v2 = parseFloat(indicator_json[ta_title][key]["MACD"]);
            var v3 = parseFloat(indicator_json[ta_title][key]["MACD_Hist"]);
            dataSeries.push(v);
            dataSeries2.push(v2);
            dataSeries3.push(v3);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_macd', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"] + ' MACD',
                type: 'line',
                color: '#F66464',

                data: dataSeries2.reverse()

            },{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"] + ' MACD_Signal',
                type: 'line',
                color: '#0d0d4f',

                data: dataSeries.reverse()

            },
                {
                    labels: {
                        enabled: false
                    },
                    tooltip: {
                        valueDecimals: 2
                    },
                    name: indicator_json['Meta Data']["1: Symbol"] + ' MACD_Hist',
                    type: 'column',
                    color: '#58f613',
                    data: dataSeries3.reverse()

                }]
        });
    }

    function drawStoch(indicator) {

        var indicator_json = [];
        indicator_json = $scope.idxData['STOCH'];

        var dataSeries = [];
        var dataSeries2 = [];
        var dateArray = [];
        var count = 0;

        var ta_title = "Technical Analysis: " + indicator;

        for(var key in indicator_json[ta_title]) {

            var v = parseFloat(indicator_json[ta_title][key]["SlowD"]);
            var v2 = parseFloat(indicator_json[ta_title][key]["SlowK"]);
            dataSeries.push(v);
            dataSeries2.push(v2);
            dateArray.push(key);
            if (++count > DISPLAY_PERIOD) break;
        }

        var newChart = new Highcharts.chart('page_idx_stoch', {
            chart: {
                type: 'line'
            },
            title: {
                text: indicator_json['Meta Data']["2: Indicator"]
            },
            subtitle: {
                text: '<a style=\"color:blue;\" href=\"https://www.alphavantage.co\">Source: Alpha Vantage</a>'
            },
            xAxis: {
                categories: dateArray.reverse(),
                startOnTick: true,
                endOnTick: true,
                tickInterval: 5
            },
            yAxis: {
                title: {
                    text: indicator
                },
                labels: {
                    enabled: true
                }
            },
            plotOptions: {
                labels: {
                    enabled: false
                },
                line: {
                    enableMouseTracking: true
                },
                series: {
                    marker: {
                        enabled: false
                    },}
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            // Input data
            series: [{
                labels: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                },
                name: indicator_json['Meta Data']["1: Symbol"] + ' SlowD',
                type: 'line',
                color: '#F66464',

                data: dataSeries.reverse()

            },
                {
                    labels: {
                        enabled: false
                    },
                    tooltip: {

                        valueDecimals: 2
                    },
                    name: indicator_json['Meta Data']["1: Symbol"] + ' SlowK',
                    type: 'line',
                    color: '#6b97f6',

                    data: dataSeries2.reverse()

                }]
        });
    }


});