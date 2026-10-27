package com.gdxsoft.easyweb.resources;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 * 内部文件工具：MD5 摘要、读写 classpath 资源、解压 zip。
 */
public class MyUtils {
	private final static String[] strHex = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E",
			"F" };

	public static String md5(byte[] buf) {
		try {
			// 此 MessageDigest 类为应用程序提供信息摘要算法的功能
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			// 转换为MD5码
			byte[] digest = md5.digest(buf);
			return hex(digest);
		} catch (Exception e) {
			return e.getLocalizedMessage();
		}
	}

	public static String hex(byte[] digest) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < digest.length; i++) {
			int d = digest[i];
			if (d < 0) {
				d += 256;
			}
			int d1 = d / 16;
			int d2 = d % 16;
			sb.append(strHex[d1] + strHex[d2]);
		}

		return sb.toString();
	}

	/**
	 * Read the binary contents of the file
	 *
	 * @param path the file name and path
	 * @return binary contents
	 * @throws IOException
	 */
	public static byte[] readFileBytes(String path) throws IOException {
		File file = new File(path);
		if (file.exists()) { // 按照文件读取
			return Files.readAllBytes(Paths.get(path));
		} else {
			path = path.replace("\\", "/").replace("//", "/").replace("//", "/").replace("//", "/").replace("//", "/");
			URL url = MyUtils.class.getResource(path);
			if (url == null) {
				url = MyUtils.class.getClassLoader().getResource(path);
			}
			if (url == null) {
				throw new IOException("The file " + path + " not exists in resource and file ");
			}
			// 从jar包中读取
			return IOUtils.toByteArray(url);
		}
	}

	/**
	 * Create a binary file
	 *
	 * @param path        The file name and path to be created
	 * @param bytes       The saved binary
	 * @param isOverWrite Whether to overwrite
	 * @throws Exception
	 */
	public static void createBinaryFile(String path, byte[] bytes, boolean isOverWrite) throws Exception {
		File img = new File(path);
		MyUtils.buildPaths(img.getParent());
		if (isOverWrite || (!isOverWrite && !img.exists())) {
			FileUtils.writeByteArrayToFile(img, bytes);
		}
	}

	/**
	 * Unzip files to the target dir
	 *
	 * @param zipFilePath the zip file path and name
	 * @param targetPath  the unziped dir
	 * @return list of unziped files
	 * @throws IOException
	 */
	public static List<String> unZipFile(String zipFilePath, String targetPath) throws IOException {

		File target = new File(targetPath);
		if (!target.exists()) {
			target.mkdirs();
		}
		targetPath = target.getAbsolutePath();

		String path = targetPath + File.separator;

		Enumeration<?> entries;
		ZipFile zipFile;
		zipFile = new ZipFile(zipFilePath);
		entries = zipFile.entries();
		List<String> fileList = new ArrayList<String>();
		while (entries.hasMoreElements()) {
			ZipEntry entry = (ZipEntry) entries.nextElement();

			if (entry == null || entry.isDirectory()) {
				continue;
			}
			try {
				String filePath = path + entry.getName();
				File ftmp = new File(filePath);
				MyUtils.buildPaths(ftmp.getParentFile().getAbsolutePath());

				copyInputStream(zipFile.getInputStream(entry),
						new BufferedOutputStream(new FileOutputStream(filePath)));
				fileList.add(filePath);
			} catch (IOException e) {
				System.out.println(e.getMessage());
			}
		}
		zipFile.close();
		return fileList;
	}

	private static final void copyInputStream(InputStream in, OutputStream out) throws IOException {
		byte[] buffer = new byte[1024];
		int len;

		while ((len = in.read(buffer)) >= 0)
			out.write(buffer, 0, len);

		in.close();
		out.close();
	}

	/**
	 * Create the paths
	 *
	 * @param path the path
	 * @return result
	 */
	public static boolean buildPaths(String path) {
		File dir = new File(path);
		if (!dir.exists()) {
			dir.mkdirs();
		}
		return dir.exists();
	}
}
