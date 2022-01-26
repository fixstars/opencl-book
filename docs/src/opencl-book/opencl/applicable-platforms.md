---
description: >-
  This section will introduce the main concepts and key terms necessary to gain
  familiarity with OpenCL. Some terms may be shortened for the ease of reading
  (e.g. OpenCL Devices → Devices).
---

# Applicable Platforms

## _Host + Device_

Up until this point, the processors in heterogeneous systems (OpenCL platforms) were called control processors and compute processors, but OpenCL defines these as follows.

**1. Host**

Environment where the software to control the devices is executed. This is typically the CPU as well as the memory associated with it.

**2. OpenCL Devices**

Environment where the software to perform computation is executed. GPU, DSP, Cell/B.E., CPU are some of the typically used devices, which contain numerous compute units. The memory associated with the processors is also included in the definition of a device.

There are no rules regarding how the host and the OpenCL device are connected. In the case of CPU + GPU, PCI Express is used most often (**Figure 2.4**). For CPU servers, the CPUs can be connected over Ethernet, and use TCP/IP for data transfer.

**Figure 2.4: Host and OpenCL device for CPU and GPU (CUDA) environment**

![](<../.gitbook/assets/Screen_Shot_2021-12-23_at_10.41.19_AM.png>)

OpenCL device is expected to contain multiple Compute Units, which is made up of multiple Processing Elements. As an example, the GPU described in OpenCL terms is as follows (**Figure 2.5**).

• OpenCL Device - GPU

• Compute Unit - Streaming Multiprocessor (SM)

• Processing Element - Scalar Processor (SP)

**Figure 2.5: Symmetry of OpenCL device and GPU configuration**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.36.11_PM.png>)

## _Application Structure_

This section will discuss a typical application that runs on the host and device.

OpenCL explicitly separates the program run on the host side and the device side (**Figure 2.6**).

**Figure 2.6: Host program and kernel**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.37.57_PM.png>)

The program run on the device is called a kernel. When creating an OpenCL application, this kernel is written in OpenCL C, and compiled using the OpenCL compiler for that device.

The host is programmed using C/C++ using the OpenCL runtime API, which is linked to an OpenCL runtime library implemented for the host-device combination. This code is compiled using compilers such as GCC and Visual Studio.

As stated earlier, the host controls the device using the OpenCL runtime API. Since OpenCL expects the device to not be running an operating system, the compiled kernel needs help from the host in order to be executed on the device. Since the OpenCL runtime implementation takes care of these tasks, the programmer will not have to know the exact details of how to perform these tasks, which is unique to each platform combination.

## _Parallel Programming Models_

OpenCL provides API for the following programming models.

• Data parallel programming model

• Task parallel programming model

In the data parallel programming model, the same kernel is passed through the command queue to be executed simultaneously across the compute units or processing elements.

For the task parallel programming model, different kernels are passed through the command queue to be executed on different compute units or processing elements (**Figure 2.7**)

**Figure 2.7: Data parallel and Task parallel**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.39.00_PM.png>)

For data parallel programming models, each kernel requires a unique index so the processing is performed on different data sets. OpenCL provides this functionality via the concept of index space.

OpenCL gives an ID to a group of kernels to be run on each compute unit, and another ID for each kernel within each compute unit, which is run on each processing element. The ID for the compute unit is called the Workgroup ID, and the ID for the processing element is called the Work Item ID. When the user specifies the total number of work items (global item), and the number of work items to be ran on each compute unit (local item), the IDs are given for each item by the OpenCL runtime API. The index space is defined and accessed by this ID set. The number of workgroups can be computed by dividing the number of global items by the number of local items (**Figure 2.8**).

**Figure 2.8: Example of index-space deployment**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.39.47_PM.png>)

The ID can have up to 3 dimensions to correspond to the data to process. The retrieval of this ID is necessary when programming the kernel, so that each kernel processes different sets of data.

The index space is defined for task parallel processing as well, in which both the number of work groups and the work items are 1.

## _Memory Model_

OpenCL allows the kernel to access the following 4 types of memory (**Figure 2.9**).

**1. Global Memory**

Memory that can be read from all work items. It is physically the device's main memory.

**2. Constant Memory**

Also memory that can be read from all work items. It is physically the device's main memory, but can be used more efficiently than global memory if the compute units contain hardware to support constant memory cache. The cost memory is set and written by the host.

**3. Local Memory**

Memory that can be read from work items within a work group. It is physically the shared memory on each compute units.

**4. Private Memory**

Memory that can only be used within each work item. It is physically the registers used by each processing element.

**Figure 2.9: OpenCL memory model**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.40.56_PM.png>)

The 4 memory types mentioned above all exist on the device. The host side has its own memory as well. However, only the kernel can only access memory on the device itself. The host, on the other hand, is capable of reading and writing to the global, constant, and the host memory.

Note that the physical location of each memory types specified above assumes NVIDIA's GPUs. The physical location of each memory types may differ depending on the platform. For example, if the devices are x86 multi-core CPUs, all 4 memory types will be physically located on the main memory on the host. However, OpenCL requires the explicit specification of memory types regardless of the platform.
