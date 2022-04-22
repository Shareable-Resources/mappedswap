# Levels which will be log in files.log

1. error: 0
2. warn: 1
3. info: 2
4. http: 3
5. debug: 4
6. verbose: 5

# Levels which will be log in console

1. error: 0
2. warn: 1
3. info: 2
4. http: 3
5. debug: 4

# Levels will be rotate daily

```terminal
   logger.info("info log will log in info.log");
   logger.warn("warn log will log in info.log");
   logger.debug("debug log will log in info.log");
   logger.http("http log will log in info.log");
   logger.error("error log will log in info.log as well as error.log");
   logger.verbose("verbose log will log in console");
```

# Code

![Alt text](./Example_code.png 'In code')

# Effect

![Alt text](./Example_effect.png 'In code')

# Files

![Alt text](./Example_files.png 'File generated in runtime')
