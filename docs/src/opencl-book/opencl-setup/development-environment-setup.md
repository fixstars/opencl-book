---
description: >-
  This section will walk through the setup process of available OpenCL
  environments as of January 2012. Note that the name of the executables may
  change in the future.
---

# Development Environment Setup

## _Intel OpenCL Setup_

In this section, we will walkthrough the process of installing Intel OpenCL SDK on Windows and Linux. The installation steps can also be found on their website: [http://software.intel.com/en-us/articles/installation-notes-opencl-sdk](http://software.intel.com/en-us/articles/installation-notes-opencl-sdk)

**For Windows**

To install the Intel OpenCL SDK on Windows, first download the executable from their website. Note that both 32-bit and 64-bit exist, and the version should be chosen accordingly.

[http://software.intel.com/en-us/articles/installation-notes-opencl-sdk](http://software.intel.com/en-us/articles/installation-notes-opencl-sdk)

**Figure 3.1: Intel OpenCL SDK download screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.06.50_PM.png>)

Unless there are special requirements, the installation should be performed using the default values.

**For Linux**

The installation executable is packaged as a RPM file for Red Hat distribution. The RPM can be downloaded from the same URL as above. Extract the downloaded file and install the RPM as root.

**Example for Intel OpenCL SDK 1.5**

> \# tar xzf intel\_ocl\_sdk\_1.5\_x64.tgz
>
> \# rpm -i intel\_ocl\_sdk\_1.5\_x64.rpm

We have also verified the installation procedure could be performed successfully on Fedora 16 Desktop (64-bit).

## _Apple OpenCL Setup_

OpenCL is included by default on Mac OS X 10.6 and later, but requires Apple's IDE "Xcode" for development. The Xcode setup procedure varies depending on the version of the Mac OS X. Here, we will walk through the installation of Xcode for Lion and Snow Leopard

**For Lion**

The version of Xcode that can be used on Lion is "Xcode 4". The installation can be done in 1 of the 2 following ways:

1\) From the AppStore (**Figure 3.2**)

2\) From Apple's Xcode site [http://developer.apple.com/xcode/](http://developer.apple.com/xcode/)

**Figure 3.2: Xcode download screen on the AppStore**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.09.16_PM.png>)

**For Snow Leopard**

The Xcode cannot be installed from the AppStore on Snow Leopard, so this must be done manually. Also, "Xcode 4" cannot be installed on Snow Leopard, so "Xcode 3" must be used instead.

Access Apple's Xcode site [http://developer.apple.com/xcode](http://developer.apple.com/xcode) and login with your Apple ID. You should get the screen shown in **Figure 3.3**. Make sure to follow the link to download Xcode 3.

**Figure 3.3: Xcode 3 download screen (http://developer.apple.com/xcode/)**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.09.59_PM.png>)

Once you have the installation package for Xcode, double click on the dmg file, and then double click on the mpkg file to start the installation of Xcode (**Figure 3.4**).

**Figure 3.4: File in Xcode archives**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.10.36_PM.png>)

The installation can be performed by following the default options for the most part, except for one part. In the screen shown in **Figure 3.5** for custom installation, make sure to place a check mark on "UNIX Development".

**Figure 3.5: Custom installation setting**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.11.22_PM.png>)

Click next and continue on with the installation.

## _NVIDIA OpenCL Setup_

In this section, we will walk through the procedures for installing OpenCL for NVIDIA GPU's on Windows and Linux.

**For Windows**

We will walkthrough the procedures for installing NVIDIA's OpenCL on a 32-bit Windows 7 machine. First, find out what GPU is present from Device Manager -> Display Adapter. Make sure this device supports CUDA. You will also need Visual Studio to build the SDK samples. For 32-bit, the Express Edition will suffice. Download and install Microsoft Visual C++ 2010 Express Edition from the URL below.
[http://www.microsoft.com/japan/msdn/vstudio/express](http://www.microsoft.com/japan/msdn/vstudio/express)

Download the following files from NVIDIA's OpenCL download page [http://developer.nvidia.com/cuda-downloads](http://developer.nvidia.com/cuda-downloads):

* Developer Drivers
  * Desktop: devdriver\_4.0\_winvista-win7\_32\_286.19\_general.exe
  * Notebook: devdriver\_4.0\_winvista-win7\_32\_286.16\_notebook.exe
* CUDA Toolkit
  * cudatoolkit\_4.1.28\_win\_32.msi
* GPU Computing SDK
  * gpucomputingsdk\_4.1.28\_win\_32.exe

**Figure 3.6: NVIDIA OpenCL download page**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.13.46_PM.png>)

The installation should be done in the following order: NVIDIA Driver, CUDA Toolkit, GPU Computing SDK. Double click on the NVIDIA driver executable to start the installation.

**Figure 3.7: NVIDIA driver install screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.14.29_PM.png>)

Follow the prompts on the screens (**Figure 3.7**). Restart the system when you are prompted to do so.

Next, install the CUDA Toolkit by double clicking on the installer. Follow the prompts on the screens (**Figure 3.8**).

**Figure 3.8: NVIDIA toolkit install screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.15.04_PM.png>)

Finally, install the GPU Computing SDK. Follow the prompts on the screens (**Figure 3.9**). You will be prompted to register during the installation. Once the installation finishes successfully, restart the system.

**Figure 3.9: NVIDIA GPU computing SDK install screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.15.57_PM.png>)

Now we are ready to execute the sample programs contained in the GPU Computing SDK. On your Desktop should be an icon with the name "NVIDIA GPU Computing SDK Browser". This should show a listing of all the sample programs. Open the "OpenCL Samples" tab to show a listing of the sample codes written in OpenCL. The listing is ordered based on difficulty, with basic programs at the top and advanced programs at the bottom. Some samples include a whitepaper that explains the program content.

**For Linux**

In this section, we will install NVIDIA OpenCL on Ubuntu 11.04 (64 bit). First, make sure that the GPU is CUDA-enabled by executing the following command.

> \# lspci | grep -i nvidia

\> OS setup

Before we can install CUDA, we may need to reconfigure Ubuntu's graphic driver. This is due to the fact that the open-source version of the NVIDIA GPU driver, called "nouveau", may conflict with NVIDIA's driver.

First, remove all packages that start with "nvidia" using the command below.

> $ sudo apt-get --purge remove nvidia\*

Next, create a blacklist file shown in **List 3.1** under /etc/modprobe.d/. This is to make sure that no nouveau-related kernel modules get loaded.

**List 3.1: /etc/modprobe.d/blacklist-nouveau.conf**

> blacklist nvidiafb
>
> blacklist nouveau
>
> blacklist rivafb
>
> blacklist rivatv
>
> blacklist vga16fb
>
> options nouveau modeset=0

Now, update initramfs using the command below.

> $ sudo update-initramfs -u

At this point, the system should be restarted. Once the system is restarted, install tools required for development.

> $ sudo apt-get update
>
> $ sudo apt-get install build-essential

\> CUDA setup

Download the following files from NVIDIA's OpenCL download page (**Figure 3.10**) [http://developer.nvidia.com/cuda-downloads](http://developer.nvidia.com/cuda-downloads):

\* Developer Drivers

\- Desktop: NVIDIA-Linux-x86\_64-285.05.33.run

\* CUDA Toolkit

\- cudatoolkit\_4.1.28\_linux\_64\_ubuntu11.04.run

\* GPU Computing SDK

\- gpucomputingsdk\_4.1.28\_linux.run

**Figure 3.10: NVIDIA OpenCL download page (for Linux)**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.24.44_PM.png>)

First task is to install the driver. However, the driver installation cannot be performed when the X Window System is running. Switch into the console mode by logging out and pressing "Alt + Ctrl + F2". Enter the following command to stop the display manager.

> $ sudo service gdm stop

You may need to press "Alt + Ctrl + F2" again to get back to the prompt. Enter the following to install the driver.

> $ sudo sh NVIDIA-Linux-x86\_64-285.05.33.run

You will receive a few prompts, but select "OK" throughout. Once the installation finishes successfully, restart the system by entering:

> $ sudo reboot

Now we are ready to install the CUDA Toolkit. Enter the following command to do so.

> $ sudo sh cudatoolkit\_4.1.28\_linux\_64\_ubuntu11.04.run

You will be prompted for the installation directory, but use the default location, which should be /usr/local/cuda/. Once the installation is complete, a few environmental variables must be set in .bashrc (**List 3.2**).

**List 3.2: Append this at the end of the bashrc**

> export CUDA\_HOME="/usr/local/cuda"
>
> export LD\_LIBRARY\_PATH="${LD\_LIBRARY\_PATH}:${CUDA\_HOME}/lib64"
>
> export PATH=${CUDA\_HOME}/bin:${PATH}

Lastly, the GPU Computing SDK will be installed. This SDK should be installed for each users. Login as a normal user, and enter the following command.

> $ sh gpucomputingsdk\_4.1.28\_linux.run

You will again be asked for an installation directory, but use the default location, which should be under $HOME. You maybe asked for the directory for CUDA Toolkit, in which case you should enter /usr/local/cuda/. The installation should now be finished.

## _AMD OpenCL Setup_

In this section, we will walk through the procedures for installing OpenCL for AMD GPU's on Windows and Linux. OpenCL for AMD is contained in "AMD APP SDK", which first requires the installation of the latest "Catalyst Software Suite", which contains drivers AMD CPU/GPU, OpenCL runtime, etc.

**For Windows**

In this section, we will install AMD OpenCL on Windows 7.

Download and install the latest Catalyst Software Suite from the URL below (**Figure 3.11**):
[http://support.amd.com/us/gpudownload/Pages/index.aspx](http://support.amd.com/us/gpudownload/Pages/index.aspx)


**Figure 3.11: Catalyst Software Suite download screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.42.38_PM.png>)

Enter your system information for Steps 1\~4, and press Step 5. This should give you a listing of the appropriate Catalyst Software Suite. Select the suite most appropriate to the system.

Now, download AMD APP SDK from the URL below (**Figure 3.12**). The most up-to-date version is 1.6.

[http://support.amd.com/us/gpudownload/Pages/index.aspx](http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx)

**Figure 3.12: AMD APP SDK download screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.44.15_PM.png>)

Download and install the SDK, and restart the system once finished.

**For Linux**

In this section, we will install AMD OpenCL on Ubuntu 11.4.

As is the case with Windows, the Catalyst Software Suite must be installed prior to the AMD APP SDK. To do so, first open the System Settings, located on the panel on the left side of the screen (**Figure 3.13**).

**Figure 3.13: Ubuntu System Settings screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.45.09_PM.png>)

Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from vendors (**Figure 3.14** Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from venders).

**Figure 3.14: Vendor-supplied proprietary driver selection screen**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_10.09.47_PM.png>)

If more than one driver is listed, selecting one and clicking the "Activate" button will start the installation.

Next, download AMD APP SDK from the URL below (**Figure 3.12**):

[http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx](http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx)

Start the installation by entering commands as follows.

**For 32bit**

> $ tar xzf AMD-APP-SDK-v2.6-lnx32.tgz
>
> $ sudo ./Install-AMD-APP.sh
>
> \[sudo] password for username:
>
> 32-bit Operating System Found...
>
> Starting Installation of AMD APP....
>
> SDK package name is :AMD-APP-SDK-v2.6-RC3-lnx32.tgz
>
> Current directory path is : /home/opencl/appsdk
>
> Untar command executed succesfully, The SDK package available
>
> Untar command executed succesfully, The ICD package available
>
> Copying files to /opt/AMDAPP/ ...
>
> SDK files copied successfully at /opt/AMDAPP/
>
> Updating Environment vairables...
>
> 32-bit path is :/opt/AMDAPP/lib/x86
>
> Environment vairables updated successfully
>
> /sbin/ldconfig.real: Can't stat /lib/i686-linux-gnu: No such file or directory
>
> /sbin/ldconfig.real: Can't stat /usr/lib/i686-linux-gnu: No such file or directory
>
> /sbin/ldconfig.real: Path \`/lib/i386-linux-gnu' given more than once
>
> /sbin/ldconfig.real: Path \`/usr/lib/i386-linux-gnu' given more than once
>
> AMD APP installation Completed
>
> \>> Reboot required to reflect the changes
>
> \>> Please ignore the ldconfig errors, Expected behaviour
>
> \>> Please refer the 'AMDAPPlog file' in the same directory
>
> \>> Refer the README.txt in the same directory for more info

****

As is shown in the installation log above, you should restart the system. After restarting, make sure the setup has completed successfully by making sure files such as /opt/AMDAPP/include/CL/cl.h and /usr/lib/libOpenCL\* are present.

