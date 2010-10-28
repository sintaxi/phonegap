package com.phonegap.util;

import net.rim.device.api.crypto.MD5Digest;

public final class MD5 {
	
	public static String hash(String val) {
	    byte[] bytes = val.getBytes();
	    MD5Digest digest = new MD5Digest();
	    digest.update(bytes, 0, bytes.length);
	    byte[] md5 = new byte[digest.getDigestLength()];
	    digest.getDigest(md5, 0, true);
	    return convertToHex(md5);
	}

	protected static String convertToHex(byte[] data) {
        StringBuffer buf = new StringBuffer();
        for (int i = 0; i < data.length; i++) {
            int halfbyte = (data[i] >>> 4) & 0x0F;
            int two_halfs = 0;
            do {
                if ((0 <= halfbyte) && (halfbyte <= 9))
                    buf.append((char) ('0' + halfbyte));
                else
                    buf.append((char) ('a' + (halfbyte - 10)));
                halfbyte = data[i] & 0x0F;
            } while(two_halfs++ < 1);
        }
        return buf.toString();
    }
}
