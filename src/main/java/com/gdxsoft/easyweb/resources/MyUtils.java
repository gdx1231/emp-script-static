package com.gdxsoft.easyweb.resources;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

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
	
	public static String md5(String str) {
		// 加密后的16进制字符串
		
		try {
			// 此 MessageDigest 类为应用程序提供信息摘要算法的功能
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			// 转换为MD5码
			byte[] digest = md5.digest(str.getBytes("utf-8"));
			return hex(digest);
		} catch (Exception e) {
			return e.getLocalizedMessage();
		}
	}

	/**
	 * Delete a file
	 * 
	 * @param name The file path and name
	 * @return result
	 */
	public static boolean delete(String name) {
		if (name == null || name.trim().length() == 0) {
			return false;
		}
		File f = new File(name);
		if (!f.exists()) {
			return false;
		}
		try {
			return f.delete();
		} catch (Exception err) {
			System.err.println(err.getMessage());
			return false;
		}
	}

	/**
	 * Get the extension form the file name
	 * 
	 * @param name the file name
	 * @return the extension
	 */
	public static String getFileExt(String name) {
		if (name.endsWith(".")) {
			return "";
		}

		int m = name.lastIndexOf(".");
		if (m > 0) {
			return name.substring(m + 1);
		} else {
			return "";
		}
	}

	/**
	 * Get the file name without extension
	 * 
	 * @param name the file name
	 * @return the file name without extension
	 */
	public static String getFileNoExt(String name) {
		File f = new File(name);
		String name1 = f.getName();
		int m = name1.lastIndexOf(".");
		if (m > 0) {
			return name1.substring(0, m);
		} else {
			return name1;
		}
	}

	/**
	 * Change the file extension
	 * 
	 * @param name   the file's name and path
	 * @param newExt new extension
	 * @return new file name and path
	 */
	public static String changeFileExt(String name, String newExt) {
		File f = new File(name);
		String nameNoExt = getFileNoExt(f.getName());
		String path = (f.getParent() == null ? "" : f.getParent() + File.separator) + nameNoExt + "." + newExt;
		f = new File(path);
		return f.getAbsolutePath();
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
	 * Read the file contents(UTF8) from file or resource
	 * 
	 * @param filePath the file name and path
	 * @return the file contents (UTF8)
	 * @throws IOException
	 */
	public static String readFileText(String filePath) throws IOException {
		File f1 = new File(filePath);
		if (f1.exists()) {
			return FileUtils.readFileToString(f1, StandardCharsets.UTF_8);
		} else {
			filePath = filePath.replace("\\", "/").replace("//", "/").replace("//", "/").replace("//", "/")
					.replace("//", "/");
			URL url = MyUtils.class.getClassLoader().getResource(filePath);
			if (url == null) {
				throw new IOException("The file " + filePath + " not exists in resource and file ");
			}
			return IOUtils.toString(url, StandardCharsets.UTF_8);
		}
	}

	/**
	 * Read the zip/jar file binary (UTF8)
	 * 
	 * @param zipFilePath   the zip or jar file
	 * @param innerFileName zip or jar inner path and name
	 * @return the content of the file in the zip/jar
	 * @throws IOException
	 */
	public static byte[] readZipBytes(String zipFilePath, String innerFileName) throws IOException {
		ZipFile zipFile = null;
		try {
			zipFile = new ZipFile(zipFilePath);
			Enumeration<? extends ZipEntry> list = zipFile.entries();

			while (list.hasMoreElements()) {
				ZipEntry ze = list.nextElement();
				if (ze.getName().equals(innerFileName)) {
					InputStream inputStream = zipFile.getInputStream(ze);
					return IOUtils.toByteArray(inputStream);
				}
			}
			return null;
		} catch (IOException e) {
			throw e;
		} finally {
			if (zipFile != null) {
				try { // 关闭流
					zipFile.close();
				} catch (IOException e) {
				}
			}
		}
	}

	/**
	 * Get the zip/jar file list
	 * 
	 * @param zipFilePath the zip or jar file
	 * @return The zip file list
	 * @throws IOException
	 */
	public static List<String> getZipList(String zipFilePath) throws IOException {
		List<String> al = new ArrayList<String>();
		ZipFile zipFile = null;
		try {
			zipFile = new ZipFile(zipFilePath);
			Enumeration<? extends ZipEntry> list = zipFile.entries();

			while (list.hasMoreElements()) {
				ZipEntry ze = list.nextElement();
				al.add(ze.getName());
			}
			return al;
		} catch (IOException e) {
			throw e;
		} finally {
			if (zipFile != null) {
				try { // 关闭流
					zipFile.close();
				} catch (IOException e) {
				}
			}
		}
	}

	public static String readZipText(String zipFilePath, String innerFileName) throws IOException {
		ZipFile zipFile = null;
		try {
			zipFile = new ZipFile(zipFilePath);
			Enumeration<? extends ZipEntry> list = zipFile.entries();

			while (list.hasMoreElements()) {
				ZipEntry ze = list.nextElement();
				if (ze.getName().equals(innerFileName)) {
					InputStream inputStream = zipFile.getInputStream(ze);
					return IOUtils.toString(inputStream, StandardCharsets.UTF_8);
				}
			}
			return null;
		} catch (IOException e) {
			throw e;
		} finally {
			if (zipFile != null) {
				try { // 关闭流
					zipFile.close();
				} catch (IOException e) {
				}
			}
		}

	}

	/**
	 * Copy file
	 * 
	 * @param fileFrom from
	 * @param fileTo   to
	 * @throws IOException
	 */
	public static void copyFile(String fileFrom, String fileTo) throws IOException {
		FileUtils.copyFile(new File(fileFrom), new File(fileTo));
	}

	/**
	 * Compress the file with ZIP
	 * 
	 * @param filePath the file name and path
	 * @return the ZIP file name and path
	 * @throws IOException
	 */
	public static String zipFile(String filePath) throws IOException {
		int BUFFER = 4096;
		String zipFileName = filePath + ".zip";
		BufferedInputStream origin = null;
		FileOutputStream dest = new FileOutputStream(zipFileName);
		ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
		byte data[] = new byte[BUFFER];
		File f = new File(filePath);

		FileInputStream fi = new FileInputStream(f);
		origin = new BufferedInputStream(fi, BUFFER);
		ZipEntry entry = new ZipEntry(f.getName());
		out.putNextEntry(entry);
		int count;
		while ((count = origin.read(data, 0, BUFFER)) != -1) {
			out.write(data, 0, count);
		}
		origin.close();
		out.close();
		return zipFileName;
	}

	/**
	 * Compress the path with ZIP, exclude sub directories
	 * 
	 * @param path the path
	 * @return zipFileName the ZIP file name and path
	 * @throws IOException
	 */
	public static String zipPath(String path) throws IOException {
		File f = new File(path);
		String zipFileName = f.getPath() + ".zip";
		if (f.isFile()) {
			return zipFile(path);
		}
		zipFiles(f.listFiles(), zipFileName);
		return zipFileName;
	}

	/**
	 * Compress the files with ZIP
	 * 
	 * @param files       the file path and name array
	 * @param zipFileName the ZIP file path and name
	 * @throws IOException
	 */
	public static void zipFiles(String[] files, String zipFileName) throws IOException {
		File[] file = new File[files.length];
		for (int i = 0; i < files.length; i++) {
			file[i] = new File(files[i]);
		}
		zipFiles(file, zipFileName);
	}

	/**
	 * Compress all files in the root directory, including sub directories
	 * 
	 * @param pathRoot    the root directory
	 * @param zipFileName the compressed ZIP file path and name
	 * @throws IOException
	 */
	public static void zipPaths(String pathRoot, String zipFileName) throws IOException {
		FileOutputStream dest = new FileOutputStream(zipFileName);
		ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
		File root = new File(pathRoot);
		zipPathFiles(out, root, root.getAbsolutePath());
		out.close();
	}

	/**
	 * Compress path and files, include sub directories
	 * 
	 * @param out                ZipOutputStream
	 * @param parent             the root path
	 * @param zipReplaceRootPath replace the ZIP entry name prefix
	 * @throws IOException
	 */
	private static void zipPathFiles(ZipOutputStream out, File parent, String zipReplaceRootPath) throws IOException {
		int BUFFER = 1024 * 100;// 100k
		byte data[] = new byte[BUFFER];
		File[] files = parent.listFiles();
		for (int i = 0; i < files.length; i++) {
			File f1 = files[i];
			if (f1.isDirectory()) {
				// Recursive
				zipPathFiles(out, f1, zipReplaceRootPath);
				continue;
			}
			FileInputStream fi = new FileInputStream(f1);
			BufferedInputStream origin = new BufferedInputStream(fi, BUFFER);
			String entryName = f1.getAbsolutePath().replace(zipReplaceRootPath + File.separator, "");

			if (File.separator.equals("\\")) {
				// 替换windows目录格式为unix
				entryName = entryName.replace("\\", "/");
			}
			ZipEntry entry = new ZipEntry(entryName);
			out.putNextEntry(entry);
			int count;
			while ((count = origin.read(data, 0, BUFFER)) != -1) {
				out.write(data, 0, count);
			}
			origin.close();
		}
	}

	/**
	 * Compress files
	 * 
	 * @param files       the files array
	 * @param zipFileName the compressed ZIP file path and name
	 * @throws IOException
	 */
	public static void zipFiles(File[] files, String zipFileName) throws IOException {
		int BUFFER = 4096;
		FileOutputStream dest = new FileOutputStream(zipFileName);
		ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
		byte data[] = new byte[BUFFER];
		for (int i = 0; i < files.length; i++) {
			File f1 = files[i];
			if (f1.isDirectory()) {
				continue;
			}
			FileInputStream fi = new FileInputStream(f1);
			BufferedInputStream origin = new BufferedInputStream(fi, BUFFER);
			ZipEntry entry = new ZipEntry(f1.getName());
			out.putNextEntry(entry);
			int count;
			while ((count = origin.read(data, 0, BUFFER)) != -1) {
				out.write(data, 0, count);
			}
			origin.close();

		}
		out.close();
	}

	/**
	 * Unzip files to the zipFilePath.xxx.unzip dir
	 * 
	 * @param zipFilePath the zip file path and name
	 * @return list of unziped files
	 * @throws IOException
	 */
	public static List<String> unZipFile(String zipFilePath) throws IOException {
		String unzipPath = "";
		for (int i = 0; i < 100; i++) {
			String unPath = zipFilePath + "_" + i + ".unzip";
			File file1 = new File(unPath);
			if (file1.exists()) {
				continue;
			} else {
				if (file1.mkdir()) {
					unzipPath = unPath;
					break;
				} else {
					continue;
				}
			}
		}

		if (unzipPath.length() == 0) {
			throw new IOException("Unable to create unzip directory");
		}

		return unZipFile(zipFilePath, unzipPath);
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

			if (entry.isDirectory()) {
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
	 * Create a hash file based on the content
	 * 
	 * @param content     the content
	 * @param ext         the hash file extension
	 * @param path        the directory where the hash file is saved
	 * @param isOverWrite whether to overwrite the hash file
	 * @return the hash file name, exclude path
	 * @throws Exception
	 */
	public static String createHashTextFile(String content, String ext, String path, boolean isOverWrite)
			throws Exception {
		String hash = "t_" + content.hashCode();
		path = path.trim() + "/";

		if (!buildPaths(path)) {
			throw new Exception("Can't create the directory (" + path + ")");
		}

		String fileName = hash + "." + ext.trim().toLowerCase();
		String filePath = path + fileName;
		File img = new File(filePath);
		if (isOverWrite || (!isOverWrite && !img.exists())) {
			createNewTextFile(filePath, content);
		}
		return fileName;
	}

	/**
	 * Create a new text file
	 * 
	 * @param fileName the saved file name and directory
	 * @param content  the saved text content (UTF8)
	 * @throws IOException
	 */
	public static void createNewTextFile(String fileName, String content) throws IOException {
		File file = new File(fileName);
		if (!file.getParentFile().exists()) {
			MyUtils.buildPaths(file.getParent());
		}
		FileUtils.write(file, content, "UTF-8");

	}

	/**
	 * Create a binary file based on the MD5 of the binary content, and the saved
	 * file name is MD5 + extension
	 * 
	 * @param bytes       The binary content
	 * @param md5         The md5
	 * @param ext         The saved file extension
	 * @param path        The saved directory
	 * @param isOverWrite Whether to overwrite
	 * @return The saved file name (MD5 + extension), exclude directory
	 * @throws Exception
	 */
	public static String createMd5File(byte[] bytes, String md5, String ext, String path, boolean isOverWrite)
			throws Exception {

		path = path.trim() + "/";

		if (!buildPaths(path)) {
			throw new Exception("Can't create the directory (" + path + ")");
		}

		String fileName = md5 + "." + ext.trim().toLowerCase();
		String filePath = path + fileName;
		createBinaryFile(filePath, bytes, isOverWrite);
		return fileName;
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
