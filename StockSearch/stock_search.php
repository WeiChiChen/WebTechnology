<?php
define("AV_API_KEY", "your_key");
define("NEWS_DISPLAY_NUM", 5);
define("API_RETRY_CNT", 1);
header("Access-Control-Allow-Origin: *");

class StockSearch
{
    // Variables
    private $symbol;
    private $stsd;
    private $infoArray;
    private $dayArray;
    private $newsArray;
    private $indicArray;
    private $errorInput;
    private $dataForIndicator;


    // TODO: Refactor many getData functions to one, and also parse the json back in batches

    function __construct()
    {
        date_default_timezone_set('US/Eastern');
        //'America/Los_Angeles'
        $this->infoArray = array(
            'symbol' => '',
            'close' => 0,
            'open' => 0,
            'pclose' => 0,
            'change' => 0,
            'percent' => 0,
            'range' => 0,
            'volume' => 0,
            'timestamp' => "YYYY-MM-DD",
            'day_array' => array()
        );

        $this->indicArray = array('Price', 'SMA', 'EMA', 'STOCH', 'RSI', 'ADX', 'CCI', 'BBANDS', 'MACD');
        $this->newsArray = array();
        $this->errorInput = false;
        $this->dataForIndicator = array();
    }

    function handleRequest() {
        $response['Error'] = null;

        if (empty($_GET['stocksymbol'])) {
            $response['Error'] = 'Empty Symbol';
        }

        $this->symbol = $_GET['stocksymbol'];

        switch ($_GET['type']) {
            case 'INFO':
                $data = $this->getDailyData('info');
                break;
            case 'Price':
                $data = $this->getDailyData('price');
                break;
            case 'SMA':
                $data = $this->getSMAData();
                break;
            case 'EMA':
                $data = $this->getEMAData();
                break;
            case 'STOCH':
                $data = $this->getStochData();
                break;
            case 'RSI':
                $data = $this->getRSIData();
                break;
            case 'ADX':
                $data = $this->getADXData();
                break;
            case 'CCI':
                $data = $this->getCCIData();
                break;
            case 'BBANDS':
                $data = $this->getBBANDSData();
                break;
            case 'MACD':
                $data = $this->getMACDData();
                break;
            case 'HIST':
                $data = $this->getDailyData('hist');
                break;
            case 'News':
                $data = $this->getNewsData();
                break;
            default:
                break;
        }

        if (empty($data)) {
            // for some API, just return the empty array [] when queried failed
            $response['Error'] = 'Query Failed';
            // TODO: return die can respond to $http from AngularJS(even android APP by volley API), and let it execute error callback!
            // https://stackoverflow.com/questions/6163970/set-response-status-code
            header( 'HTTP/1.1 401 Unauthorized', true, 401);
            //header( 'HTTP/1.1 204 No Content', true, 204); // this is no good because client still get success
            die("API is not working now, please try later.");
            //echo "this is error try echo"; // use die is better, will return at die line
        } else {
            $response['Data'] = $data;
        }

        // Notice this part! Every thing we put in response should not be json, because we want encode it at next line
        $json_response = json_encode($response);
        header('Content-type: application/json');
        echo($json_response);
    }

    function getDailyData($option)
    {
        $retryCount = 0;
        do {
            $json = file_get_contents('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='
                . $_GET['stocksymbol'] . '&outputsize=full&apikey=' . AV_API_KEY);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        if (!empty($json) && $option ==='info') {
            $this->stsd = json_decode($json, true);
            $this->infoArray['symbol'] = $this->stsd['Meta Data']["2. Symbol"];

            $this->dayArray = array();
            foreach ($this->stsd["Time Series (Daily)"] as $key => $value) {
                array_push($this->dayArray, $value);
            }

            $this->infoArray['close'] = round($this->dayArray[0]["4. close"], 2);
            $this->infoArray['open'] = round($this->dayArray[0]["1. open"], 2);
            $this->infoArray['pclose'] = round($this->dayArray[1]["4. close"], 2);
            $this->infoArray['change'] = round($this->infoArray['close'] - $this->infoArray['pclose'], 2);
            $this->infoArray['percent'] = (round((($this->infoArray['close'] - $this->infoArray['pclose']) / $this->infoArray['pclose']) * 100, 2)) . '%';
            $this->infoArray['range'] = "" . round($this->dayArray[0]["3. low"],2) . "-" . round($this->dayArray[0]["2. high"],2);
            $this->infoArray['volume'] = $this->dayArray[0]["5. volume"];
            $this->infoArray['timestamp'] = date("Y-m-d", strtotime($this->stsd['Meta Data']["3. Last Refreshed"]));
            //$this->infoArray['day_array'] = $this->dayArray;

            return $this->infoArray;
        } else if (!empty($json) && $option ==='price') {
            $this->stsd = json_decode($json, true);
            return $this->stsd;
        } else if (!empty($json) && $option ==='hist') {
            $hist = array();
            $this->stsd = json_decode($json, true);
            foreach ($this->stsd["Time Series (Daily)"] as $key => $value) {
                // get "$key" is the time stamp
                $item = [];
                $date = new DateTime($key);
                array_push($item, $date->getTimestamp()*1000);
                array_push($item, floatval($value["4. close"]));
                array_push($hist, $item);
            }

            //return json_encode($hist);
            return $hist;
        }

        return $json;

    }

    function getNewsData()
    {
        /*
         *   Seeking Alpha News
         *   <rss xmlns:sa="https://seekingalpha.com/api/1.0" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
         *   <channel>
         *       <title>
         *       Microsoft Corporation - News and Analysis on Seeking Alpha
         *       </title>
         *       <link>https://seekingalpha.com</link>
         *       <description>
         *       © seekingalpha.com. Use of this feed is limited to personal, non-commercial use and is governed by Seeking Alpha's Terms of Use (https://seekingalpha.com/page/terms-of-use). Publishing this feed for public or commercial use and/or misrepresentation by a third party is prohibited.
         *       </description>
         *       <item>
         *           <title>
         *           Videogame sales slip in October, before crucial holidays
         *           </title>
         *           <link>
         *           https://seekingalpha.com/symbol/MSFT/news?source=feed_symbol_MSFT
         *           </link>
         *           <guid isPermaLink="false">https://seekingalpha.com/MarketCurrent:3313097</guid>
         *           <pubDate>Thu, 16 Nov 2017 18:42:31 -0500</pubDate>
         *           <sa:author_name>Jason Aycock</sa:author_name>
         *           <media:thumbnail url=""/>
         *           <sa:picture/>
         *        ...
         *        </item>
         */
        // Get xml file
        $note = "https://seekingalpha.com/api/sa/combined/" . $this->symbol . ".xml";
        $xml = simplexml_load_file($note, 'SimpleXMLElement', LIBXML_NOCDATA) or die("Error: Cannot create object");
        /*
         * simplexml_load_file can not get the "namespace" entries from xml
         * TODO: Need to change to other parse
         */

        $array = json_decode(json_encode($xml), true);


        $itemLength = sizeof($array["channel"]["item"]);
        for ($i = 0, $j = 0; $i < $itemLength && $j < NEWS_DISPLAY_NUM; $i++) {
            $newsLink = $array["channel"]["item"][$i]["link"];
            if (strpos($newsLink, 'news') !== false) continue;

            $newsHeadline = $array["channel"]["item"][$i]["title"];
            $newsPubTime = date("Y-m-d H:i:s", strtotime($array["channel"]["item"][$i]["pubDate"]));
            //echo "</br>results:".$newsHeadline." ".$newsPubTime."~".$newsLink;
            $newsAuth = $array["channel"]["item"][$i]['sa_author_name'];
            $record = array($newsHeadline, $newsLink, $newsPubTime, $newsAuth);
            //echo "</br>record:".$record[0].$record[1].$record[2];
            array_push($this->newsArray, $record);
            $j++;
        }

        header('Content-type: application/json');
        return $this->newsArray;
    }

    function getSMAData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=SMA&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getEMAData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=EMA&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getRSIData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=RSI&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getADXData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=ADX&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getCCIData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=CCI&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getMACDData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=MACD&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getBBANDSData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=BBANDS&symbol='.$this->symbol.
                '&interval=daily&time_period=10&series_type=close&nbdevup=3&nbdevdn=3&time_period=5&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    function getStochData()
    {
        $retryCount = 0;
        do {
            $api = 'https://www.alphavantage.co/query?function=STOCH&symbol='.$this->symbol.
                '&interval=daily&slowkmatype=1&slowdmatype=1&time_period=10&apikey='.AV_API_KEY;
            $json = file_get_contents($api);

            // This decode only for check error, because some API return empty array, others return error message
            $json_decoded = json_decode($json, true);
            if (isset($json_decoded["Error Message"])) {
                $json = [];
            }

        } while (empty($json) && ($retryCount++ < API_RETRY_CNT));

        return $json_decoded;
    }

    // Old version
    function constructAPI($func='TIME_SERIES_DAILY', $inv='weekly', $tp='10', $st='close') {
        $api = '';

        if ($this->symbol !== '') {

            $api = 'https://www.alphavantage.co/query?function='.$func.'&symbol='.$this->symbol.'&interval='.
                $inv.'&time_period='.$tp.'&series_type='.$st.'&apikey='.AV_API_KEY;
        }
        return $api;
    }

    // Old version
    function checkParams()
    {
        if (!empty($_GET['stocksymbol'])) {
            $this->symbol = $_GET['stocksymbol'];
            $json = file_get_contents('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='
                .$_GET['stocksymbol'].'&outputsize=full&apikey='.AV_API_KEY);

            if ($json == NULL) {
                $this->errorInput = true;
                $errorMsg = [];
                $errorMsg['error'] = "empty result";
                echo(json_encode($errorMsg));
            }

            $this->stsd = json_decode($json, true);

            //Error Handling for incorrect input or API call
            if(isset($this->stsd["Error Message"])) {
                $this->errorInput = true;
                $errorMsg = [];
                $errorMsg['error'] = $this->errorInput;
                echo(json_encode($errorMsg));
            }

        }
    }

    // Old version
    function isErrorInput() {
        return $this->errorInput;
    }

    // Old version
    function doSearch()
    {
        // this part to concatenate
        if (isset($this->stsd) && !$this->errorInput) {

            if ($_GET['batch'] === 'infoArray') {
                $this->infoArray['symbol'] = $this->stsd['Meta Data']["2. Symbol"];

                $this->dayArray = array();
                foreach ($this->stsd["Time Series (Daily)"] as $key => $value) {
                    array_push($this->dayArray, $value);
                }

                $this->infoArray['close'] = round($this->dayArray[0]["4. close"], 2);
                $this->infoArray['open'] = round($this->dayArray[0]["1. open"], 2);
                $this->infoArray['pclose'] = round($this->dayArray[1]["4. close"], 2);
                $this->infoArray['change'] = round($this->infoArray['close'] - $this->infoArray['pclose'], 2);
                $this->infoArray['percent'] = (round((($this->infoArray['close'] - $this->infoArray['pclose']) / $this->infoArray['pclose']) * 100, 2)) . '%';
                $this->infoArray['range'] = "" . $this->dayArray[0]["3. low"] . "-" . $this->dayArray[0]["2. high"];
                $this->infoArray['volume'] = $this->dayArray[0]["5. volume"];
                $this->infoArray['timestamp'] = date("Y-m-d", strtotime($this->stsd['Meta Data']["3. Last Refreshed"]));

                header('Content-type: application/json');
                echo(json_encode($this->infoArray));
            }
        }
    }

    // Old version
    function getSTSD() {
        return $this->stsd;
    }

    // Old version
    function getAllIndicateData() {
        if (isset($this->stsd) && !$this->errorInput) {

            if ($_GET['batch'] === 'indicators') {

                $data1 = $this->getSTSD();
                $data2 = $this->getSMAData();
                $data3 = $this->getEMAData();
                $data4 = $this->getStochData();
                $data5 = $this->getRSIData();
                $data6 = $this->getADXData();
                $data7 = $this->getCCIData();
                $data8 = $this->getBBANDSData();
                $data9 = $this->getMACDData();

                $this->dataForIndicator = ['Price' => $data1, 'SMA' => $data2, 'EMA' => $data3,
                    'STOCH' => $data4, 'RSI' => $data5, 'ADX' => $data6,
                    'CCI' => $data7, 'BBANDS' => $data8, 'MACD' => $data9];

                header('Content-type: application/json');
                echo(json_encode($this->dataForIndicator));

            }
        }
    }

    // Old version
    function parseNews()
    {
        /*
         *   Seeking Alpha News
         *   <rss xmlns:sa="https://seekingalpha.com/api/1.0" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
         *   <channel>
         *       <title>
         *       Microsoft Corporation - News and Analysis on Seeking Alpha
         *       </title>
         *       <link>https://seekingalpha.com</link>
         *       <description>
         *       © seekingalpha.com. Use of this feed is limited to personal, non-commercial use and is governed by Seeking Alpha's Terms of Use (https://seekingalpha.com/page/terms-of-use). Publishing this feed for public or commercial use and/or misrepresentation by a third party is prohibited.
         *       </description>
         *       <item>
         *           <title>
         *           Videogame sales slip in October, before crucial holidays
         *           </title>
         *           <link>
         *           https://seekingalpha.com/symbol/MSFT/news?source=feed_symbol_MSFT
         *           </link>
         *           <guid isPermaLink="false">https://seekingalpha.com/MarketCurrent:3313097</guid>
         *           <pubDate>Thu, 16 Nov 2017 18:42:31 -0500</pubDate>
         *           <sa:author_name>Jason Aycock</sa:author_name>
         *           <media:thumbnail url=""/>
         *           <sa:picture/>
         *        ...
         *        </item>
         */
        if (!empty($_GET['stocksymbol']) && !isset($this->stsd["Error Message"])) {

            if ($_GET['batch'] === 'news') {
                // Get xml file
                $note = "https://seekingalpha.com/api/sa/combined/" . $this->symbol . ".xml";
                $xml = simplexml_load_file($note, 'SimpleXMLElement', LIBXML_NOCDATA) or die("Error: Cannot create object");
                /*
                 * simplexml_load_file can not get the "namespace" entries from xml
                 * TODO: Need to change to other parse
                 */

                $array = json_decode(json_encode($xml), true);

                /*
                $xmlparser = xml_parser_create();
                xml_parse_into_struct($xmlparser, $xml, $array);
                xml_parser_free($xmlparser);
                var_dump($array);*/



                $itemLength = sizeof($array["channel"]["item"]);
                for ($i = 0, $j = 0; $i < $itemLength && $j < NEWS_DISPLAY_NUM; $i++) {
                    $newsLink = $array["channel"]["item"][$i]["link"];
                    if (strpos($newsLink, 'news') !== false) continue;

                    $newsHeadline = $array["channel"]["item"][$i]["title"];
                    $newsPubTime = date("Y-m-d H:i:s", strtotime($array["channel"]["item"][$i]["pubDate"]));
                    //echo "</br>results:".$newsHeadline." ".$newsPubTime."~".$newsLink;
                    $newsAuth = $array["channel"]["item"][$i]['sa_author_name'];
                    $record = array($newsHeadline, $newsLink, $newsPubTime, $newsAuth);
                    //echo "</br>record:".$record[0].$record[1].$record[2];
                    array_push($this->newsArray, $record);
                    $j++;
                }

                header('Content-type: application/json');
                echo(json_encode($this->newsArray));
            }
        }
    }

    // Old version
    function getNews() {
        return $this->newsArray;
    }

}

$stockSearch = new StockSearch();
$stockSearch->handleRequest();
/*
$stockSearch->checkParams();
$stockSearch->doSearch();
$stockSearch->parseNews();
$stockSearch->getAllIndicateData();*/
?>