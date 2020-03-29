package internal

import (
	"math/rand"
	"os"
	"sync"
	"time"
)

// Got from: https://github.com/googleapis/google-cloud-go/blob/52020a63249f2e4201e59458009f5af55acf483d/firestore/collref.go#L127-L138
const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

var (
	rngMu sync.Mutex
	rng   = rand.New(rand.NewSource(time.Now().UnixNano() ^ int64(os.Getpid())))
)

// UniqueID func
func UniqueID() string {
	var b [20]byte
	rngMu.Lock()
	for i := 0; i < len(b); i++ {
		b[i] = alphanum[rng.Intn(len(alphanum))]
	}
	rngMu.Unlock()
	return string(b[:])
}
