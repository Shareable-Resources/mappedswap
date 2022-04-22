package log

import (
	"os"
	"strings"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"github.com/sirupsen/logrus"
)

//var Root string = "ROOT"

var loggerDict map[string]*logrus.Logger
var defaultLogger *logrus.Logger

func init() {
	loggerDict = make(map[string]*logrus.Logger)
	logger := logrus.New()

	logger.SetOutput(os.Stderr)
	setDefaultLoggerFormat(logger)
	logger.SetLevel(logrus.DebugLevel)

	defaultLogger = logger
}

// NewLogger function creates a logger from logrus. It finds the fileName and extension from filePath by dot(.) index.
// New file path will be generated base on fileName_YYYY-mm-dd.extension
// e.g. UserServerConfig_2021-07-07.log
// e.g. UserServerConfig_2021-07-08.log
// If the log is splited, like rotation is 8 hrs, maxAge is 23hrs, means 3 log will be generated within a dat
// e.g. UserServerConfig_2021-07-07.log.1
// e.g. UserServerConfig_2021-07-07.log.2
// e.g. UserServerConfig_2021-07-07.log.3
func NewLogger(name string, filePath string, logLevel logrus.Level) (*logrus.Logger, error) {
	logger := logrus.New()

	lastIndex := strings.LastIndex(filePath, ".")
	var extension string
	var fileName string
	if lastIndex >= 0 {
		extension = filePath[lastIndex:]
		fileName = filePath[:lastIndex]
	}
	// rotatelogs.WithMaxAge(24*time.Hour) : Only keep the log for a day (24hr)
	// rotatelogs.WithRotationTime(24*time.Hour) : Split the log for every 24hr
	// WithLink (symbolic link)
	// UserServerConfig_2021-07-07.log
	writer, err := rotatelogs.New(fileName+"_%Y-%m-%d"+extension, rotatelogs.WithLinkName(filePath),
		rotatelogs.WithMaxAge(24*time.Hour),
		rotatelogs.WithRotationTime(24*time.Hour))

	if err != nil {
		return nil, err
	}

	logger.SetOutput(writer)
	loggerDict[name] = logger

	setDefaultLoggerFormat(logger)
	logger.SetLevel(logLevel)
	return logger, nil
}

func setDefaultLoggerFormat(logger *logrus.Logger) {
	logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: time.RFC3339Nano,
		ForceColors:     false,
	})
	logger.SetReportCaller(true)
}

func GetLogger(name string) *logrus.Logger {
	logger, found := loggerDict[name]
	if !found {
		return defaultLogger
	}
	return logger
}

func GetDefaultLogger() *logrus.Logger {
	return defaultLogger
}

func GetDefaultLogPath() string {
	exePath, err := os.Executable()
	if err != nil {
		return "./"
	}
	index := strings.LastIndex(exePath, "/")
	if index >= 0 {
		return exePath[:index]
	}

	return "./"
}
