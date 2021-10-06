package main

import (
    "fmt"
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
var db sql.DB

func returnAllObs(w http.ResponseWriter, r *http.Request){
    fmt.Println("Endpoint Hit: returnAllObs")
    json.NewEncoder(w).Encode(Observations)
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
    insert, err := db.Query("INSERT INTO data VALUES ( 'TEST', 2 )")
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
    
    db, err := sql.Open("mysql", mysqlun+"@tcp("+mysqlip+")/")
    if err != nil {
       panic(err.Error())
    }

    defer db.Close()

    _,err = db.Exec("CREATE DATABASE IF NOT EXISTS art_exhibit")
      if err != nil {
             panic(err)
    }

    _,err = db.Exec("USE art_exhibit")
      if err != nil {
             panic(err)
    }

    _,err = db.Exec("CREATE TABLE IF NOT EXISTS data(content VARCHAR(50) NOT NULL, time INT NOT NULL)")
      if err != nil {
             panic(err)
    }

    // insert, err := db.Query("INSERT INTO data VALUES ( 'TEST', 2 )")
    // if err != nil {
    //    panic(err.Error())
    // }
    
    defer insert.Close()
    Observations = []SemanticObservation {
    }
    handleRequests()
}