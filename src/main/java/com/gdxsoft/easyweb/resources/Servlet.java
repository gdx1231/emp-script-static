package com.gdxsoft.easyweb.resources;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Servlet extends HttpServlet {

	/**
	 *
	 */
	private static final long serialVersionUID = -7073908316136252285L;

	private static final long CACHE_MAX_AGE_SECONDS = 86400;

	private void show(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String pathInfo = request.getPathInfo();
		String path = pathInfo;

		Resource r = Resources.getResource(path);
		response.setStatus(r.getStatus());
		if (r.getStatus() != 200) {
			return;
		}

		String etag = "W/\"" + r.getMd5() + "\"";
		response.setContentType(r.getType());
		response.setHeader("Cache-Control", "public, max-age=" + CACHE_MAX_AGE_SECONDS);
		response.setHeader("ETag", etag);
		response.setHeader("x-emp-script-static", r.getPath());

		if (isNotModified(request, etag)) {
			response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
			return;
		}

		if (!r.isBinary()) {
			response.setCharacterEncoding("utf-8");
		}
		byte[] buf = r.getBuffer();
		response.setContentLength(buf.length);
		response.getOutputStream().write(buf);
	}

	/**
	 * 按 RFC 7232 做弱比较：If-None-Match 支持 "*" 和逗号分隔的多个 etag
	 */
	static boolean isNotModified(HttpServletRequest request, String etag) {
		String ifNoneMatch = request.getHeader("If-None-Match");
		if (ifNoneMatch == null || ifNoneMatch.trim().length() == 0) {
			return false;
		}
		if ("*".equals(ifNoneMatch.trim())) {
			return true;
		}

		String current = stripWeak(etag);
		for (String item : ifNoneMatch.split(",")) {
			if (current.equals(stripWeak(item))) {
				return true;
			}
		}
		return false;
	}

	private static String stripWeak(String etag) {
		String value = etag.trim();
		return value.startsWith("W/") ? value.substring(2) : value;
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.show(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.show(request, response);
	}

	/**
	 * Returns information about the servlet, such as author, version, and
	 * copyright.
	 * 
	 * @return String information about this servlet
	 */
	public String getServletInfo() {
		return "emp-script-static";
	}
}
