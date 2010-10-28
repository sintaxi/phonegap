package com.phonegap.api;

/**
 * Command interface must be implemented by any plugin classes.
 *
 * The execute method is called by the CommandManager.
 *
 * @author davejohnson
 *
 */
public interface Command {
	String execute(String instructions);
	boolean accept(String command);
}
