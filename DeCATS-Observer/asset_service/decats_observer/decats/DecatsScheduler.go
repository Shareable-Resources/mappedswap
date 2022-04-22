package decats

import (
	"fmt"
	"time"
)

const SECOND_TO_TICK int = 00

type jobTicker struct {
	t        *time.Timer
	interval time.Duration
}

func getNextTickDuration(interval time.Duration) time.Duration {
	//var minuteToTick int

	now := time.Now()
	now = now.Truncate(interval)

	fmt.Println(now, "- now tick")
	// if interval == time.Hour {
	// 	minuteToTick = 0

	// } else {
	// 	minuteToTick = now.Minute()

	// }
	// nextTick := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), minuteToTick, SECOND_TO_TICK, 0, time.Local)
	// if nextTick.Before(now) {
	// 	nextTick = nextTick.Add(interval)
	// }
	nextTick := now.Add(interval)
	fmt.Println(nextTick, "- next tick")
	return time.Until(nextTick)
}

func NewJobTicker(interval time.Duration) jobTicker {
	fmt.Println("new tick here")
	return jobTicker{time.NewTimer(getNextTickDuration(interval)), interval}
}

func (jt jobTicker) updateJobTicker() {
	fmt.Println("next tick here")
	jt.t.Reset(getNextTickDuration(jt.interval))
}
