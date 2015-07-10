package com.developerb.gviz.events;

/**
 * @author Kim A. Betti
 */
public class UnknownErrorOccurred extends Event {

    private final String type;
    private final String message;

    public UnknownErrorOccurred(Throwable trouble) {
        type = trouble.getClass().getName();
        message = trouble.getMessage();
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    @Override
    protected String describe() {
        return String.format("Unexpected error of type %s occurred with message: %s", type, message);
    }

}
