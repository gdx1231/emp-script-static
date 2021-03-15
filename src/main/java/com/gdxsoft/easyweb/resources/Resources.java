package com.gdxsoft.easyweb.resources;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Resources {
	/**
	 * 
	 */
	private static Logger LOGGER = LoggerFactory.getLogger(Resources.class);

	/**
	 * Get the EWA static files, js, css, images ...
	 * 
	 * @param path static path
	 * @return the resource
	 */
	public static Resource getResource(String path) {
		String ext = FilenameUtils.getExtension(path);

		// for compatible
		if (path.equals("/EWA_STYLE/js/EWA_ALL.js")) {
			path = "/EWA_STYLE/js/ewa.js";
		} else if (path.equals("/EWA_STYLE/js/src/main/resources/EWA_STYLE/js/source/EWA_ALL.js")) {
			path = "/EWA_STYLE/js/ewa.js";
		} else if (path.equals("/EWA_STYLE/js/js_jquery/EWA_ALL.min.2.0.js")) {
			path = "/EWA_STYLE/js/ewa.min.js";
		} else if (path.equals("/EWA_STYLE/js/js_jquery/EWA_ALL.2.0.js")) {
			path = "/EWA_STYLE/js/ewa.js";
		}

		URL url = Resources.class.getResource(path);
		Resource r = new Resource();
		r.setPath(path);
		if (url == null) {
			r.setStatus(404);
			LOGGER.error(r.toString());
			return r;
		}
		boolean binary = false;
		if (ext.equalsIgnoreCase("js")) {
			r.setType("text/javascript");
		} else if (ext.equalsIgnoreCase("htm") || ext.equalsIgnoreCase("html")) {
			r.setType("text/html");
		} else if (ext.equalsIgnoreCase("txt") || ext.equalsIgnoreCase("csv")) {
			r.setType("text/plain");
		} else if (ext.equalsIgnoreCase("json")) {
			r.setType("text/json");
		} else if (ext.equalsIgnoreCase("css")) {
			r.setType("text/css");
		} else if (ext.equalsIgnoreCase("jpg") || ext.equalsIgnoreCase("jpeg") || ext.equalsIgnoreCase("png")
				|| ext.equalsIgnoreCase("gif")) {
			r.setType("image/" + ext);
			binary = true;
		} else {
			r.setType("application/octet-stream");
			binary = true;
		}
		r.setBinary(binary);

		try {
			if (binary) {
				byte[] buf = IOUtils.toByteArray(url);
				r.setBuffer(buf);
			} else {
				String text = IOUtils.toString(url, StandardCharsets.UTF_8);
				r.setContent(text);
			}
			LOGGER.debug(r.toString());
			return r;
		} catch (IOException e) {
			r.setStatus(500);
			LOGGER.error(r.toString());
			return r;
		}
	}

}
