package com.gdxsoft.easyweb.resources;

import java.io.File;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class DemoDataOfHsqldb {
	private static Logger LOGGER = LoggerFactory.getLogger(DemoDataOfHsqldb.class);

	public static boolean extract(String targetPath) throws Exception {
		LOGGER.info("Extract the demo data to " + targetPath);
		String savedZip = targetPath + "/hsql.data.zip";

		File existsZip = new File(savedZip);
		if (existsZip.exists()) {
			LOGGER.info("Exists " + existsZip.getAbsolutePath());
			return false;
		}
		byte[] buf = MyUtils.readFileBytes("/EmpScriptV2/hsql.data.zip");

		MyUtils.createBinaryFile(savedZip, buf, true);

		List<String> lst = MyUtils.unZipFile(savedZip, targetPath);
		lst.forEach(v -> {
			File f = new File(v);
			LOGGER.info(f.getAbsolutePath());
		});

		return true;

	}
}
