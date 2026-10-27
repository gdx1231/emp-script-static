package com.gdxsoft.easyweb.resources;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.lang.reflect.Proxy;

import javax.servlet.http.HttpServletRequest;

import org.junit.Test;

public class ServletEtagTest {

	private static final String ETAG = "W/\"abc123\"";

	private HttpServletRequest requestWithIfNoneMatch(final String value) {
		return (HttpServletRequest) Proxy.newProxyInstance(
				HttpServletRequest.class.getClassLoader(),
				new Class<?>[] { HttpServletRequest.class },
				(proxy, method, args) -> "getHeader".equals(method.getName()) ? value : null);
	}

	@Test
	public void testNoHeaderIsModified() {
		assertFalse(Servlet.isNotModified(requestWithIfNoneMatch(null), ETAG));
		assertFalse(Servlet.isNotModified(requestWithIfNoneMatch("  "), ETAG));
	}

	@Test
	public void testStarMatches() {
		assertTrue(Servlet.isNotModified(requestWithIfNoneMatch("*"), ETAG));
	}

	@Test
	public void testExactWeakEtagMatches() {
		assertTrue(Servlet.isNotModified(requestWithIfNoneMatch("W/\"abc123\""), ETAG));
	}

	@Test
	public void testStrongEtagMatches() {
		assertTrue(Servlet.isNotModified(requestWithIfNoneMatch("\"abc123\""), ETAG));
	}

	@Test
	public void testEtagsListMatches() {
		assertTrue(Servlet.isNotModified(requestWithIfNoneMatch("\"x\", W/\"abc123\", \"y\""), ETAG));
	}

	@Test
	public void testDifferentEtagDoesNotMatch() {
		assertFalse(Servlet.isNotModified(requestWithIfNoneMatch("W/\"zzz\""), ETAG));
	}
}
