package main

import "workshop/pkg/cmd"

//go:generate go tool sqlc generate

func main() {
	cmd.Run()
}
