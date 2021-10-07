package main

import (
    "fmt"
    "strconv"
    "log"
    "os"
    "io/ioutil"
    "net/http"
    "encoding/json"
    "time"
    "github.com/gorilla/mux"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

type SemanticObservation struct {
     Content string `json:"Content"`
     Time time.Time `json:"time"`
}

var Observations []SemanticObservation
var db *sql.DB
var err error


func makeStructJSON(queryText string, w http.ResponseWriter) error {

    // returns rows *sql.Rows
    rows, err := db.Query(queryText)

    if err != nil {
	log.Fatal(err)
        return err
    }
    columns, err := rows.Columns()
    if err != nil {
        fmt.Printf("Error 2")
        return err
    }

    count := len(columns)
    fmt.Printf(strconv.Itoa(count))
    values := make([]interface{}, count)
    scanArgs := make([]interface{}, count)
    for i := range values {
        scanArgs[i] = &values[i]
    }

    masterData := make(map[string][]interface{})

    for rows.Next() {
        err := rows.Scan(scanArgs...)
        if err != nil {
                return err
        }
        for i, v := range values {
            x := v.([]byte)
            //NOTE: FROM THE GO BLOG: JSON and GO - 25 Jan 2011:
            // The json package uses map[string]interface{} and []interface{} values to store arbitrary JSON objects and arrays; it will happily unmarshal any valid JSON blob into a plain interface{} value. The default concrete Go types are:
            //
            // bool for JSON booleans,
            // float64 for JSON numbers,
            // string for JSON strings, and
            // nil for JSON null.
            if nx, ok := strconv.ParseFloat(string(x), 64); ok == nil {
                masterData[columns[i]] = append(masterData[columns[i]], nx)
            } else if b, ok := strconv.ParseBool(string(x)); ok == nil {
                masterData[columns[i]] = append(masterData[columns[i]], b)
            } else if "string" == fmt.Sprintf("%T", string(x)) {
                masterData[columns[i]] = append(masterData[columns[i]], string(x))
            } else {
                fmt.Printf("Failed on if for type %T of %v\n", x, x)
            }

         }
    }

    w.Header().Set("Content-Type", "application/json")

    err = json.NewEncoder(w).Encode(masterData)

    if err != nil {
        return err
    }
    return err
}


func returnAllObs(w http.ResponseWriter, r *http.Request){
    // todo: https://stackoverflow.com/questions/42774467/how-to-convert-sql-rows-to-typed-json-in-golang
    queryText := "SELECT * FROM data"
    makeStructJSON(queryText, w)
    fmt.Println("Endpoint Hit: returnAllObs")
}

func submitObs(w http.ResponseWriter, r *http.Request){
    fmt.Println("Endpoint Hit: submitObs")
    var obs SemanticObservation
    reqBody, err := ioutil.ReadAll(r.Body)
    if err != nil {
       fmt.Println("Endpoint Hit: submitObs error")
       log.Printf("Body parse error, %v", err)
       w.WriteHeader(400) // Return 400 Bad Request.
       return
    } else {
      json.Unmarshal(reqBody, &obs)
      Observations = append(Observations, obs)
    }
    // todo elegantly handle sql (injection!)
    insert, err := db.Query("INSERT INTO data VALUES ( '"+obs.Content+"', "+obs.Time.String()+" )")
    if err != nil {
       panic(err.Error())
    }
    defer insert.Close()
 
}

func homePage(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Welcome to the HomePage!")
    fmt.Println("Endpoint Hit: homePage")
}

func handleRequests() {
    Router :=  mux.NewRouter().StrictSlash(true)
    Router.HandleFunc("/", homePage)
    Router.HandleFunc("/observations", returnAllObs)
    Router.HandleFunc("/submit", submitObs)
    log.Fatal(http.ListenAndServe("0.0.0.0:10000", Router))
}

func main() {
    // todo in docker/setup.
    // create mysql db, name art_test if it doesn't exist
    // set up user testuser with password password on that db, with access to all tables in art_test
    // create table named 'data' in the art_test db, with correct columns, following the schema above
    // table creation can be done here through a db query
    // 'CREATE TABLE IF NOT EXISTS data(content VARCHAR(50) NOT NULL, time INT NOT NULL);' or similar

    mysqlip := os.Getenv("mysqlip")
    mysqlun := os.Getenv("mysqlun")
    
    db, err = sql.Open("mysql", mysqlun+"@tcp("+mysqlip+")/")
    if err != nil {
       panic(err.Error())
    }

    defer db.Close()
    fmt.Println("Handling Requests")

    _,err = db.Exec("CREATE DATABASE IF NOT EXISTS art_exhibit")
    if err != nil {
         panic(err)
    }
    fmt.Println("Handling Requests")

    _,err = db.Exec("USE art_exhibit")
    if err != nil {
         panic(err)
    }
    fmt.Println("Handling Requests")

    _,err = db.Exec("CREATE TABLE IF NOT EXISTS data(content VARCHAR(50) NOT NULL, time INT NOT NULL)")
    if err != nil {
         panic(err)
    }
    fmt.Println("Handling Requests")

    handleRequests()
}