package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;
import java.util.List;

/**
 * @author Kim A. Betti
 */
public class TestCompleted extends TestEvent {

    private final ResultType result;
    private final Integer durationMillis;

    private final String exceptionMessage;
    private final String exceptionStacktrace;

    private final List<String> output;


    @JsonCreator
    public TestCompleted(@JsonProperty("timestamp") Date timestamp,
                         @JsonProperty("taskPath") String taskPath,
                         @JsonProperty("className") String className,
                         @JsonProperty("name") String name,
                         @JsonProperty("result") ResultType result,
                         @JsonProperty("durationMillis") Integer durationMillis,
                         @JsonProperty("exceptionMessage") String exceptionMessage,
                         @JsonProperty("exceptionStacktrace") String exceptionStacktrace,
                         @JsonProperty("output") List<String> output) {

        super(timestamp, taskPath, className, name);

        this.result = result;
        this.durationMillis = durationMillis;
        this.exceptionMessage = exceptionMessage;
        this.exceptionStacktrace = exceptionStacktrace;
        this.output = output;
    }

    public ResultType getResult() {
        return result;
    }

    public Integer getDurationMillis() {
        return durationMillis;
    }

    public String getExceptionMessage() {
        return exceptionMessage;
    }

    public String getExceptionStacktrace() {
        return exceptionStacktrace;
    }

    public List<String> getOutput() {
        return output;
    }

    public enum ResultType {
        SUCCESS, FAILURE, SKIPPED
    }

    @Override
    protected String describeTestEvent() {
        return "Completed with result " + result +  " after " + durationMillis + " milliseconds.";
    }

}
